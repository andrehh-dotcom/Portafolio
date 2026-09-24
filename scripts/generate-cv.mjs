import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../public/Orlando-Huapaya-CV.pdf");

const colors = {
  ink: "0.12 0.13 0.18",
  muted: "0.38 0.40 0.48",
  cyan: "0 0.82 1",
  purple: "0.62 0.31 0.87",
  line: "0.88 0.89 0.92",
  soft: "0.96 0.97 0.99",
  white: "1 1 1",
};

const operations = [];
const text = (value, x, y, size = 11, font = "F1", color = colors.ink) => {
  const safe = value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
  operations.push(
    `BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${safe}) Tj ET`,
  );
};
const rect = (x, y, width, height, color) => {
  operations.push(`${color} rg ${x} ${y} ${width} ${height} re f`);
};
const line = (x1, y1, x2, y2, color = colors.line, width = 1) => {
  operations.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
};

rect(0, 0, 595.28, 841.89, colors.white);
rect(0, 0, 595.28, 182, "0.04 0.04 0.08");
rect(0, 0, 11, 182, colors.cyan);
rect(11, 0, 7, 182, colors.purple);

text("ORLANDO ANDRÉ HUAPAYA HUAPAYA", 44, 790, 20, "F2", colors.white);
text("Estudiante de Ingeniería de Sistemas", 45, 759, 11, "F1", "0.77 0.80 0.88");
text("Lima, Perú  ·  ohuapayah@autonoma.edu.pe  ·  github.com/andrehh-dotcom", 45, 732, 9, "F1", "0.62 0.65 0.74");

text("PERFIL", 45, 626, 8, "F2", colors.cyan);
text("Estudiante de Ingeniería de Sistemas en la Universidad Autónoma del Perú, actualmente en el", 45, 600, 10.5, "F1", colors.ink);
text("8vo ciclo. Me intereso en el desarrollo de software, las bases de datos y la creación de", 45, 580, 10.5, "F1", colors.ink);
text("interfaces web claras, accesibles y funcionales. Busco continuar aprendiendo mediante la práctica", 45, 560, 10.5, "F1", colors.ink);
text("y aplicar mis conocimientos en proyectos y entornos colaborativos.", 45, 540, 10.5, "F1", colors.ink);

text("FORMACIÓN ACADÉMICA", 45, 480, 8, "F2", colors.purple);
line(45, 466, 550, 466);
text("Universidad Autónoma del Perú", 45, 438, 13, "F2", colors.ink);
text("Ingeniería de Sistemas  ·  8vo ciclo  ·  2026", 45, 414, 10, "F1", colors.muted);

rect(45, 330, 505, 58, colors.soft);
text("ÁREAS DE INTERÉS", 59, 365, 8, "F2", colors.cyan);
text("Desarrollo de software   /   Bases de datos   /   Interfaces web", 59, 343, 11, "F1", colors.ink);

text("HABILIDADES Y ENFOQUES", 45, 301, 8, "F2", colors.cyan);
line(45, 288, 550, 288);
const skills = [
  ["Desarrollo web", "HTML5, CSS3 y JavaScript"],
  ["Tecnología", "Diseño de software y bases de datos"],
  ["Metodología", "Aprendizaje continuo y resolución de problemas"],
  ["Intereses", "Interfaces responsivas y accesibles"],
];
skills.forEach(([label, value], index) => {
  const y = 257 - index * 35;
  text(label, 45, y, 10, "F2", colors.ink);
  text(value, 170, y, 10, "F1", colors.muted);
  if (index < skills.length - 1) line(45, y - 13, 550, y - 13);
});

text("PROYECTO DESTACADO", 45, 111, 8, "F2", colors.purple);
line(45, 98, 550, 98);
text("Portafolio personal", 45, 70, 14, "F2", colors.ink);
text("Experiencia web moderna y responsive con estética oscura, navegación fluida y foco en accesibilidad.", 45, 45, 9.5, "F1", colors.muted);
text("Tecnologías: HTML5 · CSS3 · JavaScript", 45, 23, 9, "F2", colors.ink);

let content = operations.join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
];

let pdf = "%PDF-1.4\n%PDF generated for Orlando Huapaya\n";
const offsets = [0];
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
});
const xrefOffset = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let index = 1; index <= objects.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(pdf, "latin1"));
console.log(`CV generado en ${outputPath}`);
