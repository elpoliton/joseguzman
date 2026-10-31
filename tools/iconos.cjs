// Genera assets/icons.js con los íconos (react-icons/fa) que usan las páginas: node tools/iconos.cjs
// Uso en HTML: <i data-icon="FaPlay"></i>  (deck.js / site.js los reemplazan por SVG)
const React = require('react'); const RDS = require('react-dom/server'); const fa = require('react-icons/fa'); const fs = require('fs'); const path = require('path');
const LISTA = ['FaPlay','FaPause','FaChalkboardTeacher','FaPencilAlt','FaEye','FaCheck','FaReceipt','FaBan','FaHourglassHalf','FaCogs','FaChartLine','FaCalendarAlt','FaTruck','FaFileInvoiceDollar','FaUsers','FaUniversity','FaHandHoldingUsd','FaBalanceScale','FaIndustry','FaBoxOpen','FaFileContract','FaHashtag','FaColumns','FaPercent','FaCommentDots',
  'FaExpand','FaCompress','FaChevronLeft','FaChevronRight','FaDesktop','FaFilePdf','FaArrowLeft','FaSearch','FaDownload','FaWifi','FaMicrophoneAlt','FaLandmark','FaVoteYea','FaLaptopCode','FaGraduationCap','FaExternalLinkAlt','FaBookOpen','FaGlobeAmericas','FaCalculator','FaTimes','FaCheckCircle','FaKeyboard','FaClock','FaStickyNote','FaTwitter','FaBlogger','FaHandsHelping','FaFlag','FaCertificate','FaImages','FaUserTie'];
const out = {};
for (const n of LISTA) { if (!fa[n]) throw new Error('No existe ' + n); out[n] = RDS.renderToStaticMarkup(React.createElement(fa[n], { size: '1em' })).replace(/ style="[^"]*"/, '').replace(/ height="1em" width="1em"/, ''); }
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icons.js'), '// generado por tools/iconos.cjs — no editar a mano\nwindow.ICONOS=' + JSON.stringify(out) + ';\n' +
  'window.pintarIconos=function(r){(r||document).querySelectorAll("i[data-icon]").forEach(function(e){var s=window.ICONOS[e.dataset.icon];if(s){e.innerHTML=s;e.classList.add("ico");}});};\n');
console.log(Object.keys(out).length, 'íconos');
