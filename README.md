# Iron Bridge Machinery

English and Thai website review drafts, built for `ironbridgemachinery.com`. The site uses static HTML, CSS and JavaScript with no runtime dependencies.

## Preview in Codespaces

```sh
npm run build
npm run preview
```

Open port **4173** from the Codespaces **Ports** panel and append `/inspections/` or `/th/inspections/` to the forwarded address. Locally, open [Machinery Inspections in English](http://localhost:4173/inspections/) or [Machinery Inspections in Thai](http://localhost:4173/th/inspections/). Use the flags in either header to switch languages. Run the build again after editing a source file, then refresh the browser. The build replaces the generated `dist/` directory.

The enquiry form validates and previews sample details in the browser. It has no delivery address, endpoint or storage. Sourcing needs a machine type or model. Inspection accepts a listing link or the machine type or model. From the coverage map an inspection enquiry prefills the current machine location. Thailand’s sourcing action prefills the delivery location.

## Deploy from GitHub

Import the repo from GitHub. Vercel reads the build settings from `vercel.json`. For Cloudflare Pages, use the repository root, no framework preset, build command `npm run build`, and output directory `dist`. Review the preview deployment before connecting the production domain. The review pages use a robots meta tag to keep them out of search results. Remove it once the site is approved for launch. The alternate-language links in each page head point to the corresponding production URLs.

[Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) · [Vercel build settings](https://vercel.com/docs/builds/configure-a-build)

## Edit the draft

- Edit the English copy in `site/index.html` and Thai copy in `site/th/index.html`. Each page has its own hero photo. Both pages share the same stylesheet, enquiry script and other photos. Keep the section IDs, form field names and mode identifiers consistent across both pages. Form feedback and category prefills are defined in each page’s HTML.
- Both pages use the supplied dark logo at `site/assets/photos/iron-bridge-logo-dark.png` in the header and footer. To swap it, update the image path and dimensions in both locations. The colour variables are at the top of `site/assets/site.css`. Photos are in `site/assets/photos/`. Update each photo’s alternative text, CSS crop position and credits when replacing it. You can remove an image element to use the section’s typography-led layout.
- Once an enquiry destination is approved, update `site/assets/enquiry.js` to deliver through a configured handler and update the form copy on both pages. Show confirmation only after successful delivery.
- The footer’s LinkedIn icon links to the company page. When the remaining official URLs are available, replace each corresponding placeholder button with a link using the same `.social-link` class on both language pages.

## Inspection coverage and example

- Edit country coverage, regional entries and Iron Bridge locations in [coverage.json](site/assets/maps/coverage.json). Coordinates use longitude, latitude in decimal degrees. The MEVAS coverage page was checked on **27 November 2026**. The map includes the published country list and additional countries named in the same page’s regional descriptions. Western North Africa and the GCC are represented as regions. [MEVAS coverage](https://mevas.net/where-mevas-inspects-machinery)
- Thailand is a featured buyer and delivery market. If Justin confirms on-site inspection capability, add `"direct-inspection"` to the existing `TH` entry’s `capabilities` array. The same marker will offer both enquiry actions.
- The basemap is a cropped and projected SVG of Natural Earth’s public-domain 1:110m Admin 0 Countries dataset, version 5.1.2. The map runs locally in the browser and uses approximate marker coordinates. [Natural Earth source dataset](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_admin_0_countries.geojson) · [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/)
- Both inspections pages link to the English [Iron Bridge Sample Machinery Condition Report](site/assets/reports/iron-bridge-sample-machinery-condition-report.pdf). The site and report share the fictional reference IB-SAMPLE-001 and the four AI-generated excavator images in [inspection-sample](site/assets/photos/inspection-sample/). Keep the website and report details in sync if the example changes.

## Photography, fonts and icons

The photographs are illustrative. The source and licence record is below.

| Placement | Creator | Licence and attribution | Modifications | Source |
| --- | --- | --- | --- | --- |
| English hero | ThisIsEngineering | Pexels License, attribution optional | Vest wordmark removed. Resized and converted to WebP. Responsive CSS crop and dark overlay. | [A Man in a Workshop](https://www.pexels.com/photo/a-man-in-a-workshop-19895870/) |
| Thai hero | Visen Group | Pexels License, attribution optional | Jumper logo removed. Resized and converted to WebP. Responsive CSS crop and dark overlay. | [Industrial Worker Operating Control Panel](https://www.pexels.com/photo/industrial-worker-operating-control-panel-37769416/) |
| Excavators | Janez Temlin | Pexels License, attribution optional | Centre-cropped to 3:2, resized to 960 × 640 and converted to WebP. | [Yellow Excavator at a Construction Site Outdoors](https://www.pexels.com/photo/yellow-excavator-at-a-construction-site-outdoors-37393681/) |
| Telehandlers | Jongleur100 | Worldwide public-domain release by the creator, attribution optional | Cropped to 3:2, saturation reduced, resized and converted to WebP. | [JCB 532s.jpg and licence](https://commons.wikimedia.org/wiki/File:JCB_532s.jpg#Licensing) |
| Wheel Loaders | R9 Media Photo Collective | Pexels License, attribution optional | Centre-cropped to 3:2, resized to 960 × 640 and converted to WebP. | [Bright Yellow Industrial Wheel Loader in Forest Area](https://www.pexels.com/photo/bright-yellow-industrial-wheel-loader-in-forest-area-33201219/) |
| Dump trucks | David McElwee | Pexels License, attribution optional | Centre-cropped to 3:2, resized to 960 × 640 and converted to WebP. | [A Dump Truck on a Construction Site](https://www.pexels.com/photo/a-dump-truck-on-a-construction-site-14475776/) |
| Inspection | Bulat843 | Pexels License, attribution optional | Cropped, resized and converted to WebP. | [Electrician Working with Multimeter in Workshop](https://www.pexels.com/photo/electrician-working-with-multimeter-in-workshop-33531830/) |
| Shipping | Tom Fisk | Pexels License, attribution optional | Saturation reduced, resized and converted to WebP. Responsive CSS crop. | [Drone Shot of a Docked Cargo Ship at a Port](https://www.pexels.com/photo/drone-shot-of-a-docked-cargo-ship-at-a-port-3856440/) |

Pexels permits commercial use and editing, with optional attribution. [Pexels License](https://www.pexels.com/license/)

The site self-hosts the Latin WOFF2 files for Barlow Condensed (700) and Instrument Sans (400–700) from Fontsource under the SIL Open Font License 1.1. The bundled notices are in `site/assets/fonts/`. [Barlow Condensed](https://fontsource.org/fonts/barlow-condensed) · [Instrument Sans](https://fontsource.org/fonts/instrument-sans)

The Thai page uses a self-hosted Thai subset of Noto Sans Thai (400–700), released under the SIL Open Font License 1.1. The licence notice is in `site/assets/fonts/`. The language switcher uses public-domain flag artwork from Wikimedia Commons. [Noto Sans Thai](https://fontsource.org/fonts/noto-sans-thai) · [UK flag](https://commons.wikimedia.org/wiki/File:Flag_of_the_United_Kingdom_(3-5).svg) · [Thai flag](https://commons.wikimedia.org/wiki/File:Flag_of_Thailand.svg)

The footer uses locally hosted Bootstrap Icons with Iron Bridge colours. The MIT licence is bundled in `site/assets/social/LICENSE.txt`. [Bootstrap Icons](https://icons.getbootstrap.com/)

## Before launch

- Approve the English wording, equipment categories, inspection examples and description of support for buyers in Thailand.
- Confirm the enquiry delivery method and approved contact details, plus any social or messaging URLs to show.
- Approve the logo and supply any original machinery, inspection detail or shipping photos to use, with permission to publish them. A portrait and a shareable inspection report can be added if supplied and approved.
- Review and approve the Thai wording before launch and confirm when to connect the production domain.
