const dashboard = document.querySelector('[data-coverage]');
const byId = (id) => document.getElementById(id);
const lang = document.documentElement.lang;
const local = (labels) => labels[lang] || labels.en;
const names = new Intl.DisplayNames([lang], {type: 'region'});
const englishNames = new Intl.DisplayNames(['en'], {type: 'region'});
const collator = new Intl.Collator(lang);
const countFormat = new Intl.NumberFormat(lang);

const copy = {
  en: {
    partner: 'Partner inspections',
    buyer: 'Buyer market and delivery enquiries',
    direct: 'Iron Bridge inspections',
    featured: 'Buying for Thailand? Tell us what machine you need. We can help source it, arrange an inspection where the machine is located and coordinate shipping.',
    sourcing: 'Tell us what machine you need and where it should be delivered. We can help source it, arrange an inspection where it is located and coordinate shipping.',
    inspection: 'Send the listing or machine details. We’ll check inspector availability, agree the scope and confirm fees for the machine and its location.',
    regionInspection: 'Tell us the country and town or site where the machine is located so we can check availability within this region.',
    choose: 'Choose a location',
    chooseText: 'Select a match from the list or choose a marker on the map.',
    noMatches: 'No locations found. Try another name or region.',
    keyboard: 'Use the Up and Down arrow keys to browse locations, then Enter to select.',
    unavailable: 'Coverage locations are temporarily unavailable. You can still request an inspection.',
    sourceAction: 'Request a machine',
    inspectionAction: 'Request an inspection',
    cluster: (count) => 'Show ' + count + ' nearby locations',
    close: 'Close nearby locations'
  },
  th: {
    partner: 'พื้นที่ตรวจสภาพผ่านพันธมิตร',
    buyer: 'ตลาดผู้ซื้อและพื้นที่รับจัดส่ง',
    direct: 'ตรวจสภาพโดย Iron Bridge',
    featured: 'ต้องการซื้อเครื่องจักรเพื่อใช้ในประเทศไทย? แจ้งประเภทเครื่องจักรที่ต้องการ เราช่วยจัดหา ประสานการตรวจสภาพ ณ ที่ตั้งของเครื่อง และจัดการขนส่งได้',
    sourcing: 'แจ้งเครื่องจักรที่ต้องการและปลายทางจัดส่ง เราช่วยจัดหา ประสานการตรวจสภาพ ณ ที่ตั้งของเครื่อง และจัดการขนส่งได้',
    inspection: 'ส่งลิงก์ประกาศขายหรือรายละเอียดเครื่องจักร เราจะตรวจสอบความพร้อมของผู้ตรวจ ตกลงขอบเขต และแจ้งค่าใช้จ่ายตามเครื่องจักรและสถานที่ตั้ง',
    regionInspection: 'แจ้งประเทศและเมืองหรือสถานที่ตั้งเครื่องจักร เพื่อให้เราตรวจสอบความพร้อมในภูมิภาคนี้',
    choose: 'เลือกพื้นที่',
    chooseText: 'เลือกจากรายชื่อหรือกดหมุดบนแผนที่',
    noMatches: 'ไม่พบพื้นที่ ลองค้นหาชื่ออื่นหรือเปลี่ยนภูมิภาค',
    keyboard: 'ใช้ปุ่มลูกศรขึ้นและลงเพื่อเลื่อนดูรายชื่อ แล้วกด Enter เพื่อเลือก',
    unavailable: 'ขณะนี้ไม่สามารถโหลดรายชื่อพื้นที่ได้ แต่ยังส่งคำขอตรวจสภาพผ่านแบบฟอร์มได้',
    sourceAction: 'แจ้งเครื่องจักรที่ต้องการ',
    inspectionAction: 'ขอตรวจสภาพเครื่องจักร',
    cluster: (count) => 'แสดงพื้นที่ใกล้กัน ' + count + ' แห่ง',
    close: 'ปิดรายชื่อพื้นที่ใกล้กัน'
  }
}[lang];

function locationsFrom(data) {
  const entries = new Map();
  const order = new Map(Object.keys(data.regions).map((region, index) => [region, index]));

  function add(location, capability) {
    const original = entries.get(location.id);
    const {id, region, coordinates, label, isRegion = false} = location;
    const name = label ? local(label) : names.of(id);
    const english = label ? label.en : englishNames.of(id);
    entries.set(id, {
      id, name, region, coordinates, isRegion,
      search: normalize([name, english, id, ...(data.searchAliases[id] || [])].join(' ')),
      capabilities: [...new Set([...(original?.capabilities || []), ...capability])]
    });
  }

  for (const [region, countries] of Object.entries(data.inspectionCountries)) {
    for (const [id, coordinates] of Object.entries(countries)) {
      add({id, region, coordinates}, ['partner']);
    }
  }
  for (const location of data.inspectionRegions) add({...location, isRegion: true}, ['partner']);
  for (const location of data.ironBridgeLocations) add(location, location.capabilities);

  return [...entries.values()].sort((a, b) => {
    if (a.id === data.featuredLocation) return -1;
    if (b.id === data.featuredLocation) return 1;
    return order.get(a.region) - order.get(b.region) || collator.compare(a.name, b.name);
  });
}

function normalize(text) {
  return text.toLocaleLowerCase(lang)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[.]/gu, '')
    .trim();
}

const mapWidth = 1080;
const mapHeight = 480;
const maxZoom = 13;
const world = {x: mapWidth / 2, y: mapHeight / 2, zoom: 1};
const project = ([lon, lat]) => [(lon + 180) * 3, (85 - lat) * 3];
const clamp = (number, min, max) => Math.min(max, Math.max(min, number));
const isBuyer = (location) => location.capabilities.includes('buyer');
const markerType = (location) => isBuyer(location) ? 'buyer' : 'partner';

function symbol(type) {
  const element = document.createElement('span');
  element.className = 'coverage-symbol ' + type;
  element.setAttribute('aria-hidden', 'true');
  return element;
}

function actionLink(intent, label, location) {
  const link = document.createElement('a');
  const url = new URL(dashboard.dataset.home, window.location.origin);
  url.searchParams.set('intent', intent);
  url.searchParams.set(intent === 'inspection' ? 'machineLocation' : 'destination', location.name);
  url.hash = 'enquiry';
  link.href = url.pathname + url.search + url.hash;
  link.className = 'button ' + (intent === 'source' || !isBuyer(location) ? 'button-primary' : 'button-outline');
  link.textContent = label;
  return link;
}

function initCoverage(data) {
  const all = locationsFrom(data);
  const featured = all.find(({id}) => id === data.featuredLocation);
  const search = byId('location-search');
  const region = byId('region-filter');
  const list = byId('coverage-list');
  const viewport = byId('coverage-viewport');
  const markerLayer = byId('coverage-markers');
  const worldMap = byId('world-map');
  const zoomIn = byId('zoom-in');
  const zoomOut = byId('zoom-out');
  const reset = byId('reset-map');
  let filtered = all;
  let selected = featured;
  let view = {...world};
  let openCluster;
  let highlight = featured;
  let drag;
  byId('location-keyboard-help').textContent = copy.keyboard;

  for (const [value, labels] of Object.entries(data.regions)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = local(labels);
    region.append(option);
  }

  function dimensions() {
    const {width, height} = viewport.getBoundingClientRect();
    return {width, height, base: Math.min((width - 22) / mapWidth, (height - 24) / mapHeight)};
  }

  function setView(next) {
    const {width, height, base} = dimensions();
    const scale = base * next.zoom;
    const halfX = Math.min(mapWidth / 2, width / (2 * scale));
    const halfY = Math.min(mapHeight / 2, height / (2 * scale));
    view = {...next, x: clamp(next.x, halfX, mapWidth - halfX), y: clamp(next.y, halfY, mapHeight - halfY)};
    drawMap();
  }

  function fit(locations, options = {}) {
    if (!locations.length) return setView(world);
    const points = locations.map(({coordinates}) => project(coordinates));
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
    const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
    const {width, height, base} = dimensions();
    const fitScale = Math.min((width * .69) / (maxX - minX || 1), (height * .66) / (maxY - minY || 1)) / base;
    setView({
      x: (minX + maxX) / 2, y: (minY + maxY) / 2,
      zoom: clamp(fitScale, options.min || 1, options.max || (points.length > 1 ? 5 : 2.65))
    });
  }

  function updateSummary() {
    const kind = byId('location-kind');
    kind.replaceChildren();
    byId('location-name').textContent = selected?.name ?? copy.choose;
    const description = byId('location-description');
    const actions = byId('location-actions');
    actions.replaceChildren();
    if (!selected) {
      description.textContent = copy.chooseText;
      kind.hidden = true;
      return;
    }
    kind.hidden = false;
    for (const capability of selected.capabilities) {
      const row = document.createElement('span');
      row.append(symbol(capability === 'buyer' ? 'buyer' : 'partner'), copy[capability === 'direct-inspection' ? 'direct' : capability]);
      kind.append(row);
    }
    if (isBuyer(selected)) {
      description.textContent = selected === featured ? copy.featured : copy.sourcing;
      actions.append(actionLink('source', copy.sourceAction, selected));
      const alsoInspection = selected.capabilities.some((capability) => capability !== 'buyer');
      if (alsoInspection) {
        description.textContent += ' ' + copy.inspection;
        actions.append(actionLink('inspection', copy.inspectionAction, selected));
      }
    } else {
      description.textContent = selected.isRegion ? copy.regionInspection : copy.inspection;
      actions.append(actionLink('inspection', copy.inspectionAction, selected));
    }
  }

  function selectLocation(location, fromMap = false) {
    selected = location;
    highlight = location;
    openCluster = undefined;
    updateSummary();
    for (const button of list.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.id === location.id));
    }
    if (fromMap) {
      const active = list.querySelector('[aria-pressed="true"]');
      if (active) {
        const previous = list.querySelector('button[tabindex="0"]');
        if (previous) previous.tabIndex = -1;
        active.tabIndex = 0;
        const item = active.getBoundingClientRect();
        const bounds = list.getBoundingClientRect();
        if (item.top < bounds.top) list.scrollTop += item.top - bounds.top;
        else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
      }
      drawMap();
    } else {
      const [x, y] = project(location.coordinates);
      const zoom = search.value.trim() || region.value ? Math.max(view.zoom, 2) : view.zoom;
      if (location === featured && zoom === 1) drawMap();
      else setView({x, y, zoom});
    }
  }

  function makeLocationButton(location, onSelect) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.id = location.id;
    button.setAttribute('aria-pressed', String(location === selected));
    button.append(symbol(markerType(location)), location.name);
    button.addEventListener('click', onSelect);
    return button;
  }

  function drawList() {
    const focusEntry = selected || filtered[0];
    const rows = filtered.map((location) => {
      const row = document.createElement('li');
      const button = makeLocationButton(location, () => selectLocation(location));
      button.tabIndex = location === focusEntry ? 0 : -1;
      button.setAttribute('aria-describedby', 'location-keyboard-help');
      row.append(button);
      return row;
    });
    if (!rows.length) {
      const empty = document.createElement('li');
      empty.textContent = copy.noMatches;
      rows.push(empty);
    }
    list.replaceChildren(...rows);
    list.scrollTop = 0;
    byId('location-count').textContent = countFormat.format(filtered.length);
  }

  function clustersFor(points) {
    const clusters = [];
    for (const point of points) {
      const {x, y, location} = point;
      const candidate = !isBuyer(location) && location !== selected && clusters.find(({x: cx, y: cy, locations}) =>
        !isBuyer(locations[0]) && locations[0] !== selected && Math.hypot(x - cx, y - cy) < 31
      );
      if (candidate) {
        const count = candidate.locations.length;
        candidate.x = (candidate.x * count + x) / (count + 1);
        candidate.y = (candidate.y * count + y) / (count + 1);
        candidate.locations.push(location);
      } else {
        clusters.push({x, y, locations: [location]});
      }
    }
    return clusters;
  }

  function drawClusterList(locations, trigger) {
    const popup = document.createElement('div');
    popup.className = 'coverage-cluster-list';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'close-cluster';
    close.textContent = copy.close;
    const rows = document.createElement('ul');
    for (const location of locations) {
      const row = document.createElement('li');
      row.append(makeLocationButton(location, () => {
        selectLocation(location, true);
        byId('location-actions').querySelector('a')?.focus({preventScroll: true});
      }));
      rows.append(row);
    }
    popup.append(close, rows);
    markerLayer.append(popup);
    function closeList() {
      openCluster = undefined;
      popup.remove();
      trigger.focus({preventScroll: true});
    }
    close.addEventListener('click', closeList);
    popup.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeList();
    });
    return close;
  }

  function drawMap() {
    const {width, height, base} = dimensions();
    if (width < 30 || height < 30) return;
    const scale = base * view.zoom;
    const left = width / 2 - view.x * scale;
    const top = height / 2 - view.y * scale;
    worldMap.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + mapWidth * scale + 'px';
    zoomIn.disabled = view.zoom >= maxZoom;
    zoomOut.disabled = view.zoom <= 1;
    const points = filtered.map((location) => {
      const [x, y] = project(location.coordinates);
      return {location, x: left + x * scale, y: top + y * scale};
    }).filter(({x, y}) => x >= 9 && x <= width - 9 && y >= 9 && y <= height - 9);

    markerLayer.replaceChildren();
    for (const {x, y, locations} of clustersFor(points)) {
      const [location] = locations;
      const button = document.createElement('button');
      button.type = 'button';
      button.tabIndex = -1;
      button.className = 'map-pin';
      button.style.inset = y + 'px auto auto ' + x + 'px';
      if (locations.length > 1) {
        const count = countFormat.format(locations.length);
        button.classList.add('map-cluster');
        button.textContent = count;
        button.title = copy.cluster(count);
        button.setAttribute('aria-label', button.title);
        button.addEventListener('click', () => {
          if (view.zoom < maxZoom) {
            fit(locations, {min: Math.min(view.zoom * 1.8, maxZoom), max: maxZoom});
          } else {
            markerLayer.querySelector('.coverage-cluster-list')?.remove();
            openCluster = location.id;
            drawClusterList(locations, button).focus({preventScroll: true});
          }
        });
      } else {
        button.classList.add(markerType(location));
        if (location === selected) button.classList.add('is-selected');
        if (location === highlight) button.classList.add('is-highlighted');
        button.title = location.name;
        button.setAttribute('aria-label', location.name);
        button.append(symbol(markerType(location)));
        if (location === featured) {
          const text = document.createElement('span');
          text.className = 'featured-pin-label';
          text.textContent = location.name;
          button.append(text);
        }
        button.addEventListener('click', () => selectLocation(location, true));
      }
      markerLayer.append(button);
      if (openCluster === location.id && locations.length > 1) drawClusterList(locations, button);
    }
    highlight = undefined;
  }

  function filterLocations() {
    const query = normalize(search.value);
    filtered = all.filter((location) =>
      (!region.value || location.region === region.value) && (!query || location.search.includes(query))
    );
    if (!filtered.includes(selected)) selected = undefined;
    if (!selected && filtered.length === 1) {
      selected = filtered[0];
      highlight = selected;
    }
    openCluster = undefined;
    updateSummary();
    drawList();
    if (region.value || query) fit(filtered);
    else setView(world);
  }

  function changeZoom(factor) {
    openCluster = undefined;
    setView({...view, zoom: clamp(view.zoom * factor, 1, maxZoom)});
  }

  search.addEventListener('input', filterLocations);
  region.addEventListener('change', filterLocations);
  list.addEventListener('focusin', (event) => {
    if (!event.target.matches('button')) return;
    for (const button of list.querySelectorAll('button')) {
      button.tabIndex = button === event.target ? 0 : -1;
    }
  });
  list.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) || !event.target.matches('button')) return;
    const buttons = [...list.querySelectorAll('button')];
    const index = buttons.indexOf(event.target);
    const next = {ArrowUp: index - 1, ArrowDown: index + 1, Home: 0, End: buttons.length - 1}[event.key];
    event.preventDefault();
    buttons[clamp(next, 0, buttons.length - 1)].focus();
  });
  zoomIn.addEventListener('click', () => changeZoom(1.65));
  zoomOut.addEventListener('click', () => changeZoom(1 / 1.65));
  reset.addEventListener('click', () => {
    search.value = '';
    region.value = '';
    selected = featured;
    highlight = featured;
    filterLocations();
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button') || view.zoom === 1) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
    viewport.setPointerCapture(drag.id);
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const scale = dimensions().base * view.zoom;
    const x = view.x - (event.clientX - drag.x) / scale;
    const y = view.y - (event.clientY - drag.y) / scale;
    drag = {...drag, x: event.clientX, y: event.clientY};
    openCluster = undefined;
    setView({...view, x, y});
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    viewport.addEventListener(type, () => { drag = undefined; });
  }

  byId('coverage-filters').hidden = false;
  byId('coverage-zoom').hidden = false;
  filterLocations();
  new ResizeObserver(() => setView(view)).observe(viewport);
}

const coverageData = await fetch(new URL('coverage.json', import.meta.url)).then((response) => {
  if (!response.ok) throw new Error('Coverage data could not be loaded.');
  return response.json();
}).catch(() => null);

if (coverageData) {
  initCoverage(coverageData);
} else {
  byId('coverage-list').firstElementChild.textContent = copy.unavailable;
}
