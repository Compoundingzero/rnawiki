/** Editorial medical copy cannot become public just because the code is deployed. */
export function editorialPreviewEnabled(flag = process.env.RNAWIKI_PREVIEW_EDITORIAL): boolean {
  return flag === '1'
}
