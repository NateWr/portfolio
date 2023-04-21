const Image = require("@11ty/eleventy-img");
const path = require("path");
const PostCSSPlugin = require("eleventy-plugin-postcss");
const Prism = require('prismjs');
const loadPrismLanguages = require('prismjs/components/');

const filenameFormat = function (id, src, width, format, options) {
  const { name } = path.parse(src);
  return `${name}-${width}.${format}`;
};

const viewportImageWidth = 0.9;
const viewportImageWidthSize = (viewportImageWidth * 100) + 'vw';

const imageShortcode = async (
  src,
  alt,
  className = 'image',
  loading = 'lazy',
  widths = [
    510,
    640,
    760,
    992,
    1024,
    1200,
    1400
  ],
  sizes = [
    '(min-width: 1920px) 1400px',
    '(min-width: 1600px) 1200px',
    '(min-width: 1400px) 1024px',
    '(min-width: 1280px) 992px',
    '(min-width: 1024px) 760px',
    '(min-width: 720px) 640px',
    '(min-width: 564px) 500px',
    viewportImageWidthSize,
  ]
) => {
  const extension = path.extname(src);
  const imageMetadata = await Image(src, {dryRun: true});
  const imageWidth = imageMetadata['webp'][0].width;
  const allowedWidths = widths.filter(w => w <= imageWidth);
  const allowedSizes = sizes.filter(size => {
      return size === viewportImageWidthSize
        || size.split(' ').slice(-1)[0].replace('px', '') <= imageWidth;
    });

  if (allowedSizes.length === 1) {
    const maxScreenSize = Math.floor(imageWidth / viewportImageWidth);
    allowedSizes.push('(min-width: ' + maxScreenSize + 'px) ' + imageWidth + 'w');
  }

  const newImageMetadata = await Image(src, {
    widths: [...allowedWidths],
    formats: extension === '.png'
      ? ['webp', 'png']
      : ['webp', 'jpeg'],
    outputDir: './_site/img',
    urlPath: '/img',
    filenameFormat
  });

  const imageAttributes = {
    alt,
    sizes: allowedSizes,
    loading,
    decoding: "async",
  };

  const html = Image.generateHTML(newImageMetadata, imageAttributes);

  if (className) {
    return html.replace('<picture', `<picture class="${className}"`);
  }

  return html;
};

const openGraphImageShortcode = async (src, alt = '') => {
  const width = 1200;
  const height = 630;
  const extension = path.extname(src);
  const imageMetadata = await Image(src, {dryRun: true});

  if (imageMetadata['webp'][0].width < width || imageMetadata['webp'][0].height < height) {
    throw new Error(`The image ${src} can not be used for an open graph tag. It must be at least 1200x630.`);
  }

  const format = extension === '.png'
      ? 'png'
      : 'jpeg'

  const newImageMetadata = await Image(src, {
    widths: ['1200'],
    formats: [format],
    outputDir: './_site/img',
    urlPath: '/img',
    filenameFormat
  });

  let tags = `
    <meta property="og:image" content="https://notthisway.com${newImageMetadata[format][0].url}">
    <meta property="og:image:width" content="${width}">
    <meta property="og:image:height" content="${height}">
    <meta property="twitter:image" content="https://notthisway.com${newImageMetadata[format][0].url}">
    <meta property="twitter:card" content="summary_large_image">
  `;

  if (alt) {
    tags += `
      <meta property="og:image:alt" content="${alt}">
      <meta property="twitter:image:alt" content="${alt}">
    `;
  }

  return tags;
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
};

module.exports = function(config) {
  config.setServerOptions({
    showAllHosts: true,
  });
  config.addPlugin(PostCSSPlugin);
  config.addPassthroughCopy("fonts");
  config.addPassthroughCopy("styles.css");
  config.addPassthroughCopy("video");
  config.addPassthroughCopy("img/*.svg");
  config.addPassthroughCopy("manifest.webmanifest");
  config.addShortcode('image', imageShortcode);
  config.addShortcode('backgroundImage', backgroundShortcode);
  config.addShortcode('openGraphImage', openGraphImageShortcode);
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

    await Image('img/avatar.jpg', {
      formats: ['webp', 'jpeg'],
      widths: [120, 240],
      outputDir: '_site/img',
      filenameFormat
    })

    await Image('img/site-icon.svg', {
      formats: ['png'],
      widths: [32, 180, 192, 512],
      outputDir: '_site/img',
      filenameFormat
    });
  })();
};