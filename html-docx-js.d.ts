declare module 'html-docx-js/dist/html-docx' {
  // Define the shape of the options object
  interface HtmlDocxOptions {
    orientation?: 'landscape' | 'portrait';
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  // Define the library interface
  interface HtmlDocx {
    asBlob: (content: string, options?: HtmlDocxOptions) => Blob;
  }

  // Export the default object
  const htmlDocx: HtmlDocx;
  export default htmlDocx;
}