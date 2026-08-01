// Genera un PDF A4 a partir de un nodo del DOM.
//
// jspdf y html2canvas-pro se cargan con import() dinámico para que queden en un
// chunk aparte: sólo se descargan cuando el usuario aprieta "Descargar PDF", y
// el bundle inicial de la app no crece.
//
// Se usa html2canvas-pro y no html2canvas: Tailwind v4 emite su paleta en
// oklch() y el html2canvas original no sabe parsear esa función de color.

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const MARGIN_MM = 10

export async function downloadElementAsPdf(el: HTMLElement, filename: string): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ])

  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false })
  // JPEG en vez de PNG: un recibo en PNG pesa ~2 MB y en JPEG de alta calidad
  // unos pocos cientos de kB, sin diferencia visible en texto sobre blanco.
  const imgData = canvas.toDataURL('image/jpeg', 0.95)

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const imgWidth = A4_WIDTH_MM - MARGIN_MM * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const usableHeight = A4_HEIGHT_MM - MARGIN_MM * 2

  pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, imgWidth, imgHeight)

  // Documento más alto que una página: se vuelve a dibujar la misma imagen
  // desplazada hacia arriba en cada página siguiente.
  let heightLeft = imgHeight - usableHeight
  while (heightLeft > 0) {
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM - (imgHeight - heightLeft), imgWidth, imgHeight)
    heightLeft -= usableHeight
  }

  pdf.save(filename)
}
