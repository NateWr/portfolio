const Image = require("@11ty/eleventy-img");
const path = require("path");
const PostCSSPlugin = require("eleventy-plugin-postcss");
const Prism = require('prismjs');
const loadPrismLanguages = require('prismjs/components/');

const filenameFormat = function (id, src, width, format, options) {
  const { name } = path.parse(src);
  return `${name}-${width}.${format}`;
};

const imageShortcode = async (
  src,
  alt,
  className = 'image',
  loading = 'lazy',
  widths = [
    416,
    832,
    600,
    760,
    832,
    1000,
    1400
  ],
  sizes = [
    '(min-width: 1920px) 100px',
    '(min-width: 1280px) 1000px',
    '(min-width: 834px) 760px',
    '(min-width: 720px) 600px',
    '85vw',
  ],
  formats = []
) => {
  const extension = path.extname(src);
  const imageMetadata = await Image(src, {
    widths: [...widths, null],
    formats: extension === '.png' && !formats.length
      ? ['webp', 'png']
      : ['webp', 'jpeg'],
    outputDir: '_site/img',
    urlPath: '/img',
    filenameFormat
  });

  const imageAttributes = {
    alt,
    sizes,
    loading,
    decoding: "async",
  };

  const html = Image.generateHTML(imageMetadata, imageAttributes);

  if (className) {
    return html.replace('<picture', `<picture class="${className}"`);
  }

  return html;
};

const backgroundShortcode = async (src, className, alt, loading) => {
  return `
    <picture>
      <source
        type="image/webp"
        media="(prefers-color-scheme: dark)"
        srcset="${src}-dark-480.webp 480w, ${src}-dark-768.webp 768w, ${src}-dark-1200.webp 1200w"
        sizes="(min-width:1920px) 1200px,(min-width:1280px) 55vw,(min-width: 720px) 65vw,100vw"
      >
      <source
        type="image/jpeg"
        media="(prefers-color-scheme: dark)"
        srcset="${src}-dark-480.jpeg 480w, ${src}-dark-768.jpeg 768w, ${src}-dark-1200.jpeg 1200w"
        sizes="(min-width:1920px) 1200px,(min-width:1280px) 55vw,(min-width: 720px) 65vw,100vw"
      >
      <source
        type="image/webp"
        srcset="${src}-480.webp 480w, ${src}-768.webp 768w, ${src}-1200.webp 1200w"
        sizes="(min-width:1920px) 1200px,(min-width:1280px) 55vw,(min-width: 720px) 65vw,100vw"
      >
      <source
        type="image/jpeg"
        srcset="${src}-480.jpeg 480w, ${src}-768.jpeg 768w, ${src}-1200.jpeg 1200w"
        sizes="(min-width:1920px) 1200px,(min-width:1280px) 55vw,(min-width: 720px) 65vw,100vw"
      >
      <img
        alt="${alt}"
        src="${src}-480.jpeg"
        class="${className}"
        loading="${loading}"
        width="1200"
        height="1370"
      >
    </picture>
  `;
}

module.exports = function(config) {
  config.setServerOptions({
    showAllHosts: true,
  });
  config.addPlugin(PostCSSPlugin);
  config.addPassthroughCopy("fonts");
  config.addPassthroughCopy("styles.css");
  config.addPassthroughCopy("video");
  config.addPassthroughCopy("img/*.svg");
  config.addShortcode('image', imageShortcode);
  config.addShortcode('backgroundImage', backgroundShortcode);
  config.addPairedLiquidShortcode('code', function (content, language) {
    loadPrismLanguages([language]);
    const output = Prism.highlight(content, Prism.languages[language], language);

    return `<pre class="highlight"><code class="language-${language}">${output}</code></pre>`;
  });

  (async () => {
    [
      'img/footer.png',
      'img/footer-dark.png',
      'img/header.png',
      'img/header-dark.png',

    ].forEach(async image => {
      await Image(image, {
        formats: ['webp', 'jpeg'],
        widths: [480, 768, 1200],
        outputDir: '_site/img',
        filenameFormat
      })
    });

    await Image('img/site-icon.svg', {
      formats: ['png'],
      widths: [32, 180, 192, 512],
      outputDir: '_site/img',
      filenameFormat
    });
  })();
};