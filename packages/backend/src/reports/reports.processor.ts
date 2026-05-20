import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const archiver = require('archiver');

const DISCLAIMER =
  'Отчёт сформирован на основе данных, введённых пользователем. ' +
  'Он не является медицинским заключением и не заменяет консультацию врача.';

const UPLOADS_DIR = process.env.REPORTS_DIR || 'uploads/reports';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(d: Date | null | undefined): string {
  if (!d) return '—';
  return d.toLocaleString('ru-RU');
}

function diabetesTypeLabel(t: string | null | undefined): string {
  const map: Record<string, string> = {
    TYPE_1: 'Тип 1',
    TYPE_2: 'Тип 2',
    GESTATIONAL: 'Гестационный',
    OTHER: 'Другой',
  };
  return t ? (map[t] ?? t) : 'Не указан';
}

@Processor('reports')
export class ReportsProcessor {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('generate')
  async handleGenerateReport(job: Job<{ reportId: string }>) {
    const { reportId } = job.data;

    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'PROCESSING' },
    });

    try {
      const report = await this.prisma.report.findUnique({ where: { id: reportId } });
      if (!report) throw new Error('Report not found');

      const user = await this.prisma.user.findUnique({ where: { id: report.userId } });
      if (!user) throw new Error('User not found');

      const { startDate, endDate } = report;

      const glucoseEntries = await this.prisma.glucoseEntry.findMany({
        where: { userId: report.userId, measuredAt: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { measuredAt: 'asc' },
      });

      const insulinEntries = await this.prisma.insulinEntry.findMany({
        where: { userId: report.userId, injectedAt: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { injectedAt: 'asc' },
      });

      const mealEntries = await this.prisma.mealEntry.findMany({
        where: { userId: report.userId, eatenAt: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { eatenAt: 'asc' },
      });

      const feelingEntries = await this.prisma.feelingEntry.findMany({
        where: { userId: report.userId, recordedAt: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { recordedAt: 'asc' },
      });

      const activityEntries = await this.prisma.activityEntry.findMany({
        where: { userId: report.userId, startedAt: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { startedAt: 'asc' },
      });

      if (
        glucoseEntries.length === 0 &&
        insulinEntries.length === 0 &&
        mealEntries.length === 0 &&
        feelingEntries.length === 0 &&
        activityEntries.length === 0
      ) {
        await this.prisma.report.update({
          where: { id: reportId },
          data: { status: 'FAILED', errorMsg: 'За указанный период данные не найдены.' },
        });
        return;
      }

      ensureDir(UPLOADS_DIR);

      const ts = Date.now();
      let filePath: string;
      let fileName: string;

      const data = { user, startDate, endDate, glucoseEntries, insulinEntries, mealEntries, feelingEntries, activityEntries };

      switch (report.format) {
        case 'PDF':
          fileName = `report_${reportId}_${ts}.pdf`;
          filePath = path.join(UPLOADS_DIR, fileName);
          await this.generatePDF(data, filePath);
          break;
        case 'CSV':
          fileName = `report_${reportId}_${ts}.zip`;
          filePath = path.join(UPLOADS_DIR, fileName);
          await this.generateCSVZip(data, filePath, ts);
          break;
        case 'XLSX':
          fileName = `report_${reportId}_${ts}.xlsx`;
          filePath = path.join(UPLOADS_DIR, fileName);
          await this.generateXLSX(data, filePath);
          break;
        default:
          throw new Error(`Unsupported format: ${report.format}`);
      }

      const stats = fs.statSync(filePath);

      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'COMPLETED', fileUrl: filePath, fileName, fileSize: BigInt(stats.size) },
      });

      this.logger.log(`Report ${reportId} generated: ${filePath}`);
    } catch (err) {
      this.logger.error(`Failed to generate report ${reportId}: ${err.message}`);
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'FAILED', errorMsg: err.message },
      });
    }
  }

  // ─── PDF ────────────────────────────────────────────────────────────────────

  private async generatePDF(data: any, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const { user, startDate, endDate, glucoseEntries, insulinEntries, mealEntries, feelingEntries, activityEntries } = data;
      const unit = user.glucoseUnit === 'MMOL_L' ? 'ммоль/л' : 'мг/дл';

      // Заголовок
      doc.fontSize(24).font('Helvetica-Bold').text('DiaBeta', { align: 'center' });
      doc.fontSize(16).font('Helvetica').text('Отчёт о состоянии здоровья', { align: 'center' });
      doc.moveDown();

      // Данные пользователя
      this.pdfSection(doc, 'Данные пользователя');
      doc.fontSize(11).font('Helvetica');
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Не указано';
      doc.text(`Имя: ${fullName}`);
      doc.text(`Тип диабета: ${diabetesTypeLabel(user.diabetesType)}`);
      doc.text(`Целевой диапазон: ${user.targetGlucoseMin ?? '—'} – ${user.targetGlucoseMax ?? '—'} ${unit}`);
      doc.text(`Период отчёта: ${formatDate(startDate)} – ${formatDate(endDate)}`);
      doc.moveDown();

      // Статистика глюкозы
      if (glucoseEntries.length > 0) {
        const values: number[] = glucoseEntries.map((e: any) => e.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const inRange = values.filter(
          (v) => (!user.targetGlucoseMin || v >= user.targetGlucoseMin) && (!user.targetGlucoseMax || v <= user.targetGlucoseMax),
        ).length;
        const pct = ((inRange / values.length) * 100).toFixed(1);

        this.pdfSection(doc, 'Статистика глюкозы');
        doc.fontSize(11).font('Helvetica');
        doc.text(`Средний сахар: ${avg.toFixed(2)} ${unit}`);
        doc.text(`Минимальный: ${minVal.toFixed(2)} ${unit}`);
        doc.text(`Максимальный: ${maxVal.toFixed(2)} ${unit}`);
        doc.text(`В целевом диапазоне: ${pct}% (${inRange} из ${values.length})`);
        doc.moveDown();

        // ASCII-график
        this.pdfSection(doc, 'График глюкозы');
        doc.fontSize(8).font('Courier');
        const chartWidth = 70;
        const chartHeight = 10;
        const chartMin = Math.max(0, minVal - 1);
        const chartMax = maxVal + 1;
        const step = Math.max(1, Math.ceil(glucoseEntries.length / chartWidth));
        const sampled = glucoseEntries.filter((_: any, i: number) => i % step === 0);
        for (let row = chartHeight; row >= 0; row--) {
          const threshold = chartMin + (row / chartHeight) * (chartMax - chartMin);
          const line = sampled.map((e: any) => (e.value >= threshold ? '#' : ' ')).join('');
          doc.text(`${threshold.toFixed(1).padStart(5)} |${line}`);
        }
        doc.font('Helvetica').moveDown();

        // Таблица глюкозы
        this.pdfSection(doc, 'Измерения глюкозы');
        this.pdfTableHeader(doc, [
          { x: 50, w: 140, label: 'Дата и время' },
          { x: 190, w: 90, label: 'Значение' },
          { x: 280, w: 130, label: 'Контекст' },
          { x: 410, w: 135, label: 'Комментарий' },
        ]);
        doc.font('Helvetica').fontSize(9);
        for (const e of glucoseEntries.slice(0, 200)) {
          if (doc.y > 720) doc.addPage();
          const y = doc.y;
          doc.text(formatDateTime(e.measuredAt), 50, y, { width: 140 });
          doc.text(`${e.value} ${unit}`, 190, y, { width: 90 });
          doc.text(e.context ?? '—', 280, y, { width: 130 });
          doc.text(e.comment ?? '—', 410, y, { width: 135 });
          doc.moveDown(0.2);
        }
        doc.moveDown();
      } else {
        doc.fontSize(11).text('Данные по глюкозе за период отсутствуют.').moveDown();
      }

      // Инсулин
      if (insulinEntries.length > 0) {
        if (doc.y > 680) doc.addPage();
        this.pdfSection(doc, 'Инсулин');
        this.pdfTableHeader(doc, [
          { x: 50, w: 130, label: 'Дата и время' },
          { x: 180, w: 80, label: 'Тип' },
          { x: 260, w: 100, label: 'Название' },
          { x: 360, w: 60, label: 'Доза' },
          { x: 420, w: 125, label: 'Место' },
        ]);
        doc.font('Helvetica').fontSize(9);
        for (const e of insulinEntries.slice(0, 200)) {
          if (doc.y > 720) doc.addPage();
          const y = doc.y;
          doc.text(formatDateTime(e.injectedAt), 50, y, { width: 130 });
          doc.text(e.insulinType ?? '—', 180, y, { width: 80 });
          doc.text(e.insulinName ?? '—', 260, y, { width: 100 });
          doc.text(`${e.units} ед.`, 360, y, { width: 60 });
          doc.text(e.injectionSite ?? '—', 420, y, { width: 125 });
          doc.moveDown(0.2);
        }
        doc.moveDown();
      } else {
        doc.fontSize(11).text('Данные по инсулину за период отсутствуют.').moveDown();
      }

      // Питание
      if (mealEntries.length > 0) {
        if (doc.y > 680) doc.addPage();
        this.pdfSection(doc, 'Питание');
        this.pdfTableHeader(doc, [
          { x: 50, w: 110, label: 'Дата' },
          { x: 160, w: 70, label: 'Приём' },
          { x: 230, w: 120, label: 'Блюдо' },
          { x: 350, w: 55, label: 'Углев.' },
          { x: 405, w: 40, label: 'ХЕ' },
          { x: 445, w: 50, label: 'Ккал' },
        ]);
        doc.font('Helvetica').fontSize(9);
        for (const e of mealEntries.slice(0, 200)) {
          if (doc.y > 720) doc.addPage();
          const y = doc.y;
          doc.text(formatDateTime(e.eatenAt), 50, y, { width: 110 });
          doc.text(e.mealType ?? '—', 160, y, { width: 70 });
          doc.text(e.name ?? '—', 230, y, { width: 120 });
          doc.text(e.carbohydrates != null ? `${e.carbohydrates}г` : '—', 350, y, { width: 55 });
          doc.text(e.breadUnits != null ? `${e.breadUnits}` : '—', 405, y, { width: 40 });
          doc.text(e.calories != null ? `${e.calories}` : '—', 445, y, { width: 50 });
          doc.moveDown(0.2);
        }
        doc.moveDown();
      } else {
        doc.fontSize(11).text('Данные по питанию за период отсутствуют.').moveDown();
      }

      // Самочувствие
      if (feelingEntries.length > 0) {
        if (doc.y > 680) doc.addPage();
        this.pdfSection(doc, 'Самочувствие');
        this.pdfTableHeader(doc, [
          { x: 50, w: 130, label: 'Дата' },
          { x: 180, w: 90, label: 'Состояние' },
          { x: 270, w: 70, label: 'Настроение' },
          { x: 340, w: 70, label: 'Энергия' },
          { x: 410, w: 135, label: 'Симптомы' },
        ]);
        doc.font('Helvetica').fontSize(9);
        for (const e of feelingEntries.slice(0, 200)) {
          if (doc.y > 720) doc.addPage();
          const y = doc.y;
          doc.text(formatDateTime(e.recordedAt), 50, y, { width: 130 });
          doc.text(e.feeling ?? '—', 180, y, { width: 90 });
          doc.text(e.mood != null ? String(e.mood) : '—', 270, y, { width: 70 });
          doc.text(e.energyLevel != null ? String(e.energyLevel) : '—', 340, y, { width: 70 });
          doc.text((e.symptoms ?? []).join(', ') || '—', 410, y, { width: 135 });
          doc.moveDown(0.2);
        }
        doc.moveDown();
      } else {
        doc.fontSize(11).text('Данные по самочувствию за период отсутствуют.').moveDown();
      }

      // Активность
      if (activityEntries.length > 0) {
        if (doc.y > 680) doc.addPage();
        this.pdfSection(doc, 'Физическая активность');
        this.pdfTableHeader(doc, [
          { x: 50, w: 130, label: 'Дата' },
          { x: 180, w: 120, label: 'Тип' },
          { x: 300, w: 100, label: 'Длительность' },
          { x: 400, w: 100, label: 'Интенсивность' },
        ]);
        doc.font('Helvetica').fontSize(9);
        for (const e of activityEntries.slice(0, 200)) {
          if (doc.y > 720) doc.addPage();
          const y = doc.y;
          doc.text(formatDateTime(e.startedAt), 50, y, { width: 130 });
          doc.text(e.activityType ?? '—', 180, y, { width: 120 });
          doc.text(`${e.durationMinutes} мин.`, 300, y, { width: 100 });
          doc.text(e.intensity ?? '—', 400, y, { width: 100 });
          doc.moveDown(0.2);
        }
        doc.moveDown();
      } else {
        doc.fontSize(11).text('Данные по активности за период отсутствуют.').moveDown();
      }

      // Дисклеймер
      if (doc.y > 700) doc.addPage();
      doc.moveDown();
      doc.fontSize(9).font('Helvetica-Oblique').fillColor('grey').text(DISCLAIMER, { align: 'justify' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  private pdfSection(doc: any, title: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(13).font('Helvetica-Bold').fillColor('black').text(title);
    const y = doc.y;
    doc.moveTo(50, y).lineTo(545, y).stroke();
    doc.moveDown(0.4);
  }

  private pdfTableHeader(doc: any, cols: Array<{ x: number; w: number; label: string }>) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
    const y = doc.y;
    for (const col of cols) {
      doc.text(col.label, col.x, y, { width: col.w });
    }
    doc.moveDown(0.3);
  }

  // ─── CSV ZIP ─────────────────────────────────────────────────────────────────

  private async generateCSVZip(data: any, zipPath: string, ts: number): Promise<void> {
    const tmpDir = path.join(UPLOADS_DIR, `tmp_${ts}`);
    ensureDir(tmpDir);

    const { glucoseEntries, insulinEntries, mealEntries, feelingEntries, activityEntries } = data;

    const glucosePath = path.join(tmpDir, 'glucose.csv');
    await createObjectCsvWriter({
      path: glucosePath,
      header: [
        { id: 'measuredAt', title: 'Дата и время' },
        { id: 'value', title: 'Значение' },
        { id: 'unit', title: 'Единица' },
        { id: 'context', title: 'Контекст' },
        { id: 'comment', title: 'Комментарий' },
      ],
    }).writeRecords(
      glucoseEntries.map((e: any) => ({
        measuredAt: formatDateTime(e.measuredAt),
        value: e.value,
        unit: e.unit,
        context: e.context ?? '',
        comment: e.comment ?? '',
      })),
    );

    const insulinPath = path.join(tmpDir, 'insulin.csv');
    await createObjectCsvWriter({
      path: insulinPath,
      header: [
        { id: 'injectedAt', title: 'Дата и время' },
        { id: 'insulinType', title: 'Тип' },
        { id: 'insulinName', title: 'Название' },
        { id: 'units', title: 'Доза (ед.)' },
        { id: 'injectionSite', title: 'Место' },
        { id: 'comment', title: 'Комментарий' },
      ],
    }).writeRecords(
      insulinEntries.map((e: any) => ({
        injectedAt: formatDateTime(e.injectedAt),
        insulinType: e.insulinType,
        insulinName: e.insulinName ?? '',
        units: e.units,
        injectionSite: e.injectionSite ?? '',
        comment: e.comment ?? '',
      })),
    );

    const mealsPath = path.join(tmpDir, 'meals.csv');
    await createObjectCsvWriter({
      path: mealsPath,
      header: [
        { id: 'eatenAt', title: 'Дата и время' },
        { id: 'mealType', title: 'Приём пищи' },
        { id: 'name', title: 'Блюдо' },
        { id: 'carbohydrates', title: 'Углеводы (г)' },
        { id: 'breadUnits', title: 'ХЕ' },
        { id: 'calories', title: 'Ккал' },
        { id: 'protein', title: 'Белки (г)' },
        { id: 'fat', title: 'Жиры (г)' },
      ],
    }).writeRecords(
      mealEntries.map((e: any) => ({
        eatenAt: formatDateTime(e.eatenAt),
        mealType: e.mealType,
        name: e.name,
        carbohydrates: e.carbohydrates ?? '',
        breadUnits: e.breadUnits ?? '',
        calories: e.calories ?? '',
        protein: e.protein ?? '',
        fat: e.fat ?? '',
      })),
    );

    const feelingsPath = path.join(tmpDir, 'feelings.csv');
    await createObjectCsvWriter({
      path: feelingsPath,
      header: [
        { id: 'recordedAt', title: 'Дата и время' },
        { id: 'feeling', title: 'Состояние' },
        { id: 'mood', title: 'Настроение' },
        { id: 'energyLevel', title: 'Энергия' },
        { id: 'symptoms', title: 'Симптомы' },
        { id: 'comment', title: 'Комментарий' },
      ],
    }).writeRecords(
      feelingEntries.map((e: any) => ({
        recordedAt: formatDateTime(e.recordedAt),
        feeling: e.feeling,
        mood: e.mood ?? '',
        energyLevel: e.energyLevel ?? '',
        symptoms: (e.symptoms ?? []).join('; '),
        comment: e.comment ?? '',
      })),
    );

    const activitiesPath = path.join(tmpDir, 'activities.csv');
    await createObjectCsvWriter({
      path: activitiesPath,
      header: [
        { id: 'startedAt', title: 'Дата и время' },
        { id: 'activityType', title: 'Тип' },
        { id: 'durationMinutes', title: 'Длительность (мин)' },
        { id: 'intensity', title: 'Интенсивность' },
        { id: 'comment', title: 'Комментарий' },
      ],
    }).writeRecords(
      activityEntries.map((e: any) => ({
        startedAt: formatDateTime(e.startedAt),
        activityType: e.activityType,
        durationMinutes: e.durationMinutes,
        intensity: e.intensity,
        comment: e.comment ?? '',
      })),
    );

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 6 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.file(glucosePath, { name: 'glucose.csv' });
      archive.file(insulinPath, { name: 'insulin.csv' });
      archive.file(mealsPath, { name: 'meals.csv' });
      archive.file(feelingsPath, { name: 'feelings.csv' });
      archive.file(activitiesPath, { name: 'activities.csv' });
      archive.finalize();
    });

    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // ─── XLSX ─────────────────────────────────────────────────────────────────

  private async generateXLSX(data: any, filePath: string): Promise<void> {
    const { user, startDate, endDate, glucoseEntries, insulinEntries, mealEntries, feelingEntries, activityEntries } = data;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'DiaBeta';
    wb.created = new Date();

    const unit = user.glucoseUnit === 'MMOL_L' ? 'ммоль/л' : 'мг/дл';

    // Summary
    const summary = wb.addWorksheet('Summary');
    summary.addRow(['DiaBeta — Отчёт о состоянии здоровья']);
    summary.getRow(1).font = { bold: true, size: 14 };
    summary.addRow([]);
    summary.addRow(['Имя', [user.firstName, user.lastName].filter(Boolean).join(' ') || '—']);
    summary.addRow(['Тип диабета', diabetesTypeLabel(user.diabetesType)]);
    summary.addRow(['Целевой диапазон', `${user.targetGlucoseMin ?? '—'} – ${user.targetGlucoseMax ?? '—'} ${unit}`]);
    summary.addRow(['Период', `${formatDate(startDate)} – ${formatDate(endDate)}`]);
    summary.addRow([]);

    if (glucoseEntries.length > 0) {
      const values: number[] = glucoseEntries.map((e: any) => e.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const inRange = values.filter(
        (v) => (!user.targetGlucoseMin || v >= user.targetGlucoseMin) && (!user.targetGlucoseMax || v <= user.targetGlucoseMax),
      ).length;
      summary.addRow(['Средний сахар', `${avg.toFixed(2)} ${unit}`]);
      summary.addRow(['Минимальный сахар', `${Math.min(...values).toFixed(2)} ${unit}`]);
      summary.addRow(['Максимальный сахар', `${Math.max(...values).toFixed(2)} ${unit}`]);
      summary.addRow(['В целевом диапазоне', `${((inRange / values.length) * 100).toFixed(1)}% (${inRange} из ${values.length})`]);
    }

    summary.addRow([]);
    summary.addRow([DISCLAIMER]);
    summary.getCell(`A${summary.rowCount}`).font = { italic: true, color: { argb: 'FF888888' } };
    summary.getColumn(1).width = 30;
    summary.getColumn(2).width = 55;

    // Glucose
    const glucoseWs = wb.addWorksheet('Glucose');
    glucoseWs.addRow(['Дата и время', 'Значение', 'Единица', 'Контекст', 'Комментарий']);
    glucoseWs.getRow(1).font = { bold: true };
    for (const e of glucoseEntries) {
      glucoseWs.addRow([formatDateTime(e.measuredAt), e.value, e.unit, e.context ?? '', e.comment ?? '']);
    }
    glucoseWs.columns.forEach((col) => { col.width = 22; });

    // Insulin
    const insulinWs = wb.addWorksheet('Insulin');
    insulinWs.addRow(['Дата и время', 'Тип', 'Название', 'Доза (ед.)', 'Место', 'Комментарий']);
    insulinWs.getRow(1).font = { bold: true };
    for (const e of insulinEntries) {
      insulinWs.addRow([
        formatDateTime(e.injectedAt), e.insulinType, e.insulinName ?? '',
        e.units, e.injectionSite ?? '', e.comment ?? '',
      ]);
    }
    insulinWs.columns.forEach((col) => { col.width = 20; });

    // Meals
    const mealsWs = wb.addWorksheet('Meals');
    mealsWs.addRow(['Дата и время', 'Приём пищи', 'Блюдо', 'Углеводы (г)', 'ХЕ', 'Ккал', 'Белки (г)', 'Жиры (г)']);
    mealsWs.getRow(1).font = { bold: true };
    for (const e of mealEntries) {
      mealsWs.addRow([
        formatDateTime(e.eatenAt), e.mealType, e.name,
        e.carbohydrates ?? '', e.breadUnits ?? '', e.calories ?? '',
        e.protein ?? '', e.fat ?? '',
      ]);
    }
    mealsWs.columns.forEach((col) => { col.width = 20; });

    // Feelings
    const feelingsWs = wb.addWorksheet('Feelings');
    feelingsWs.addRow(['Дата и время', 'Состояние', 'Настроение', 'Энергия', 'Симптомы', 'Комментарий']);
    feelingsWs.getRow(1).font = { bold: true };
    for (const e of feelingEntries) {
      feelingsWs.addRow([
        formatDateTime(e.recordedAt), e.feeling,
        e.mood ?? '', e.energyLevel ?? '',
        (e.symptoms ?? []).join(', '),
        e.comment ?? '',
      ]);
    }
    feelingsWs.columns.forEach((col) => { col.width = 20; });

    // Activities
    const activitiesWs = wb.addWorksheet('Activities');
    activitiesWs.addRow(['Дата и время', 'Тип', 'Длительность (мин)', 'Интенсивность', 'Комментарий']);
    activitiesWs.getRow(1).font = { bold: true };
    for (const e of activityEntries) {
      activitiesWs.addRow([
        formatDateTime(e.startedAt), e.activityType,
        e.durationMinutes, e.intensity, e.comment ?? '',
      ]);
    }
    activitiesWs.columns.forEach((col) => { col.width = 22; });

    await wb.xlsx.writeFile(filePath);
  }
}
