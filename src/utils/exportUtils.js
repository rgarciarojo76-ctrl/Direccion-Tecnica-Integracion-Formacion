import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, filename = 'cursos.xlsx') => {
  const ws = XLSX.utils.json_to_sheet(data.map(item => ({
    Curso: item.title,
    Tematica: item.tematica,
    Codigo: item.code,
    Modalidad: item.modalidad,
    Fechas: item.fechas,
    Ubicacion: item.ubicacion,
    Delegacion: item.delegacion,
    Plazas: item.plazas,
    Estado: item.estado,
    Sinergia: item.hasSynergy ? 'SI' : 'NO'
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cursos");
  XLSX.writeFile(wb, filename);
};

export const exportToPDF = (data, filename = 'cursos.pdf') => {
  const doc = new jsPDF();
  
  doc.text("Informe de Cursos - Sinergia Formativa", 14, 15);
  
  const tableColumn = ["Curso", "Temática", "Modalidad", "Fechas", "Ubicación", "Plazas", "Estado"];
  const tableRows = [];

  data.forEach(item => {
    const courseData = [
      item.title,
      item.tematica,
      item.modalidad,
      item.fechas,
      item.ubicacion,
      item.plazas,
      item.estado
    ];
    tableRows.push(courseData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] } // Slate 900
  });

  doc.save(filename);
};
