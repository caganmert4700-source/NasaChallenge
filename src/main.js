import './style.css';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = document.querySelector('#app');
let allProvinces = [];

async function loadProvinces() {
  const { data: provinces, error } = await supabase
    .from('provinces')
    .select('*')
    .order('plate_code', { ascending: true });

  if (error) {
    console.error('Veri yükleme hatası:', error);
    app.innerHTML = `<div class="error">Veriler yüklenirken hata oluştu: ${error.message}</div>`;
    return;
  }

  allProvinces = provinces;
  renderTable(provinces);
}

function getRiskColor(value, type) {
  if (type === 'earthquake' || type === 'pollution') {
    if (value >= 5) return 'risk-very-high';
    if (value >= 4) return 'risk-high';
    if (value >= 3) return 'risk-medium';
    if (value >= 2) return 'risk-low';
    return 'risk-very-low';
  }
  if (type === 'fertility') {
    if (value >= 5) return 'fertility-excellent';
    if (value >= 4) return 'fertility-good';
    if (value >= 3) return 'fertility-medium';
    if (value >= 2) return 'fertility-low';
    return 'fertility-poor';
  }
  return '';
}

function getRiskLabel(value, type) {
  if (type === 'earthquake') {
    const labels = ['Çok Düşük', 'Düşük', 'Orta', 'Yüksek', 'Çok Yüksek'];
    return labels[value - 1] || '';
  }
  if (type === 'pollution') {
    const labels = ['Çok Temiz', 'Temiz', 'Orta', 'Kirli', 'Çok Kirli'];
    return labels[value - 1] || '';
  }
  if (type === 'fertility') {
    const labels = ['Çok Düşük', 'Düşük', 'Orta', 'Verimli', 'Çok Verimli'];
    return labels[value - 1] || '';
  }
  return value;
}

function renderTable(provinces) {
  const stats = calculateStats(provinces);

  app.innerHTML = `
    <div class="container">
      <header>
        <h1>🇹🇷 Türkiye İlleri Veri Analizi</h1>
        <p class="subtitle">81 İlin Detaylı İstatistikleri</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🌡️</div>
          <div class="stat-content">
            <div class="stat-label">Ort. Sıcaklık</div>
            <div class="stat-value">${stats.avgTemp.toFixed(1)}°C</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-label">Yüksek Deprem Riski</div>
            <div class="stat-value">${stats.highEarthquake} İl</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-label">Ort. Nüfus Yoğunluğu</div>
            <div class="stat-value">${stats.avgDensity.toFixed(0)}/km²</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌾</div>
          <div class="stat-content">
            <div class="stat-label">Yüksek Verimlilik</div>
            <div class="stat-value">${stats.highFertility} İl</div>
          </div>
        </div>
      </div>

      <div class="filters">
        <input type="text" id="searchInput" placeholder="İl ara..." class="search-input">
        <select id="regionFilter" class="filter-select">
          <option value="">Tüm Bölgeler</option>
          <option value="Marmara">Marmara</option>
          <option value="Ege">Ege</option>
          <option value="Akdeniz">Akdeniz</option>
          <option value="İç Anadolu">İç Anadolu</option>
          <option value="Karadeniz">Karadeniz</option>
          <option value="Doğu Anadolu">Doğu Anadolu</option>
          <option value="Güneydoğu Anadolu">Güneydoğu Anadolu</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="plate_code">Plaka</th>
              <th class="sortable" data-sort="name">İl Adı</th>
              <th class="sortable" data-sort="region">Bölge</th>
              <th class="sortable" data-sort="avg_temperature">Ortalama<br>Sıcaklık (°C)</th>
              <th class="sortable" data-sort="earthquake_risk">Deprem<br>Riski</th>
              <th class="sortable" data-sort="air_pollution">Hava<br>Kirliliği</th>
              <th class="sortable" data-sort="population_density">Nüfus<br>Yoğunluğu (km²)</th>
              <th class="sortable" data-sort="soil_fertility">Toprak<br>Verimliliği</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            ${provinces.map(province => `
              <tr data-region="${province.region}" class="province-row" data-province-id="${province.id}" style="cursor: pointer;">
                <td class="plate-code">${province.plate_code}</td>
                <td class="province-name">${province.name}</td>
                <td class="region-badge"><span class="badge">${province.region}</span></td>
                <td class="temperature">${province.avg_temperature}°C</td>
                <td class="${getRiskColor(province.earthquake_risk, 'earthquake')}">
                  <span class="risk-badge">${getRiskLabel(province.earthquake_risk, 'earthquake')}</span>
                </td>
                <td class="${getRiskColor(province.air_pollution, 'pollution')}">
                  <span class="risk-badge">${getRiskLabel(province.air_pollution, 'pollution')}</span>
                </td>
                <td class="density">${province.population_density.toLocaleString('tr-TR')}</td>
                <td class="${getRiskColor(province.soil_fertility, 'fertility')}">
                  <span class="risk-badge">${getRiskLabel(province.soil_fertility, 'fertility')}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="legend">
        <h3>Gösterge Açıklamaları</h3>
        <div class="legend-grid">
          <div class="legend-item">
            <strong>Deprem Riski:</strong> 1 (Çok Düşük) - 5 (Çok Yüksek)
          </div>
          <div class="legend-item">
            <strong>Hava Kirliliği:</strong> 1 (Çok Temiz) - 5 (Çok Kirli)
          </div>
          <div class="legend-item">
            <strong>Toprak Verimliliği:</strong> 1 (Çok Düşük) - 5 (Çok Verimli)
          </div>
          <div class="legend-item">
            <strong>Nüfus Yoğunluğu:</strong> Kişi/km² (TÜİK 2023 verileri)
          </div>
        </div>
      </div>
    </div>
  `;

  setupFilters(provinces);
  setupSorting(provinces);
  setupRowClicks();
}

function calculateStats(provinces) {
  const avgTemp = provinces.reduce((sum, p) => sum + parseFloat(p.avg_temperature), 0) / provinces.length;
  const highEarthquake = provinces.filter(p => p.earthquake_risk >= 4).length;
  const avgDensity = provinces.reduce((sum, p) => sum + parseFloat(p.population_density), 0) / provinces.length;
  const highFertility = provinces.filter(p => p.soil_fertility >= 4).length;

  return { avgTemp, highEarthquake, avgDensity, highFertility };
}

function setupFilters(provinces) {
  const searchInput = document.getElementById('searchInput');
  const regionFilter = document.getElementById('regionFilter');

  function filterTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRegion = regionFilter.value;
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
      const provinceName = row.querySelector('.province-name').textContent.toLowerCase();
      const region = row.getAttribute('data-region');

      const matchesSearch = provinceName.includes(searchTerm);
      const matchesRegion = !selectedRegion || region === selectedRegion;

      row.style.display = matchesSearch && matchesRegion ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterTable);
  regionFilter.addEventListener('change', filterTable);
}

function setupSorting(provinces) {
  const headers = document.querySelectorAll('.sortable');
  let currentSort = { field: 'plate_code', ascending: true };

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const sortField = header.getAttribute('data-sort');

      if (currentSort.field === sortField) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.field = sortField;
        currentSort.ascending = true;
      }

      headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      header.classList.add(currentSort.ascending ? 'sort-asc' : 'sort-desc');

      const sortedProvinces = [...provinces].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        } else {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }

        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
      });

      renderTable(sortedProvinces);
    });
  });
}

function setupRowClicks() {
  const rows = document.querySelectorAll('.province-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const provinceId = row.getAttribute('data-province-id');
      const province = allProvinces.find(p => p.id === provinceId);
      if (province) {
        showProvinceDetail(province);
      }
    });
  });
}

function showProvinceDetail(province) {
  app.innerHTML = `
    <div class="container detail-view">
      <div class="detail-header">
        <button class="back-button" onclick="location.reload()">← Geri Dön</button>
        <div class="detail-title">
          <h1>${province.name}</h1>
          <div class="detail-subtitle">
            <span class="plate-badge">${province.plate_code}</span>
            <span class="region-tag">${province.region} Bölgesi</span>
          </div>
        </div>
      </div>

      <div class="detail-stats">
        <div class="detail-card temp-card">
          <div class="card-icon">🌡️</div>
          <div class="card-content">
            <div class="card-label">Ortalama Sıcaklık</div>
            <div class="card-value">${province.avg_temperature}°C</div>
            <div class="card-description">Yıllık ortalama sıcaklık değeri</div>
          </div>
        </div>

        <div class="detail-card earthquake-card">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <div class="card-label">Deprem Riski</div>
            <div class="card-value ${getRiskColor(province.earthquake_risk, 'earthquake')}">
              ${getRiskLabel(province.earthquake_risk, 'earthquake')}
            </div>
            <div class="card-description">Risk Seviyesi: ${province.earthquake_risk}/5</div>
          </div>
        </div>

        <div class="detail-card pollution-card">
          <div class="card-icon">💨</div>
          <div class="card-content">
            <div class="card-label">Hava Kirliliği</div>
            <div class="card-value ${getRiskColor(province.air_pollution, 'pollution')}">
              ${getRiskLabel(province.air_pollution, 'pollution')}
            </div>
            <div class="card-description">Kirlilik Seviyesi: ${province.air_pollution}/5</div>
          </div>
        </div>

        <div class="detail-card density-card">
          <div class="card-icon">👥</div>
          <div class="card-content">
            <div class="card-label">Nüfus Yoğunluğu</div>
            <div class="card-value">${province.population_density.toLocaleString('tr-TR')}</div>
            <div class="card-description">Kişi/km² (TÜİK 2023)</div>
          </div>
        </div>

        <div class="detail-card fertility-card">
          <div class="card-icon">🌾</div>
          <div class="card-content">
            <div class="card-label">Toprak Verimliliği</div>
            <div class="card-value ${getRiskColor(province.soil_fertility, 'fertility')}">
              ${getRiskLabel(province.soil_fertility, 'fertility')}
            </div>
            <div class="card-description">Verimlilik Seviyesi: ${province.soil_fertility}/5</div>
          </div>
        </div>
      </div>

      <div class="detail-analysis">
        <h2>Detaylı Analiz</h2>
        <div class="analysis-grid">
          <div class="analysis-section">
            <h3>🌡️ İklim Özellikleri</h3>
            <p>${province.name}, yıllık ${province.avg_temperature}°C ortalama sıcaklık ile ${getClimateDescription(province.avg_temperature)} bir iklime sahiptir. Bu sıcaklık değeri, ilin ${province.region} bölgesindeki konumu ile uyumludur.</p>
          </div>

          <div class="analysis-section">
            <h3>⚠️ Deprem Durumu</h3>
            <p>${province.name}'da deprem riski ${getRiskLabel(province.earthquake_risk, 'earthquake').toLowerCase()} seviyededir. ${getEarthquakeAnalysis(province.earthquake_risk)} Bu değerlendirme AFAD'ın güncel deprem tehlike haritalarına dayanmaktadır.</p>
          </div>

          <div class="analysis-section">
            <h3>💨 Hava Kalitesi</h3>
            <p>İldeki hava kirliliği seviyesi ${getRiskLabel(province.air_pollution, 'pollution').toLowerCase()} olarak değerlendirilmektedir. ${getPollutionAnalysis(province.air_pollution)}</p>
          </div>

          <div class="analysis-section">
            <h3>👥 Nüfus Dağılımı</h3>
            <p>${province.name}'ın nüfus yoğunluğu km² başına ${province.population_density.toLocaleString('tr-TR')} kişidir. ${getDensityAnalysis(province.population_density)}</p>
          </div>

          <div class="analysis-section">
            <h3>🌾 Tarımsal Potansiyel</h3>
            <p>İlin toprak verimliliği ${getRiskLabel(province.soil_fertility, 'fertility').toLowerCase()} seviyededir. ${getFertilityAnalysis(province.soil_fertility, province.name)}</p>
          </div>

          <div class="analysis-section">
            <h3>📍 Bölgesel Konum</h3>
            <p>${province.name}, ${province.region} bölgesinde yer almaktadır. Bu bölge, Türkiye'nin ${getRegionDescription(province.region)} bölgelerinden biridir.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getClimateDescription(temp) {
  if (temp < 8) return 'soğuk';
  if (temp < 12) return 'serin';
  if (temp < 16) return 'ılıman';
  if (temp < 19) return 'ılık';
  return 'sıcak';
}

function getEarthquakeAnalysis(risk) {
  if (risk >= 5) return 'Yüksek deprem riski nedeniyle yapıların deprem yönetmeliklerine uygun olması kritik önem taşımaktadır.';
  if (risk >= 4) return 'Deprem riski bulunmaktadır ve gerekli önlemler alınmalıdır.';
  if (risk >= 3) return 'Orta seviye deprem riski göz önünde bulundurulmalıdır.';
  if (risk >= 2) return 'Düşük seviyede deprem riski bulunmaktadır.';
  return 'Deprem riski çok düşük seviyededir.';
}

function getPollutionAnalysis(pollution) {
  if (pollution >= 5) return 'Hava kalitesi iyileştirme çalışmaları önem arz etmektedir.';
  if (pollution >= 4) return 'Endüstriyel faaliyetler ve trafik yoğunluğu hava kalitesini etkilemektedir.';
  if (pollution >= 3) return 'Orta seviye kirlilik nedeniyle bazı dönemlerde dikkat gerekebilir.';
  if (pollution >= 2) return 'Hava kalitesi genel olarak iyi seviyededir.';
  return 'Hava kalitesi mükemmel seviyededir.';
}

function getDensityAnalysis(density) {
  if (density > 1000) return 'Yüksek nüfus yoğunluğu, şehirleşme ve altyapı planlamasını önemli kılmaktadır.';
  if (density > 200) return 'Kentsel alanda ortalama üstü nüfus yoğunluğu bulunmaktadır.';
  if (density > 100) return 'Orta seviye nüfus yoğunluğu ile dengeli bir yerleşim yapısı vardır.';
  if (density > 50) return 'Nispeten düşük nüfus yoğunluğu ile geniş yaşam alanları mevcuttur.';
  return 'Düşük nüfus yoğunluğu ile geniş ve doğal alanlar hakimdir.';
}

function getFertilityAnalysis(fertility, name) {
  if (fertility >= 5) return `${name}, tarımsal üretim için son derece elverişli topraklara sahiptir ve bölgenin tarım merkezlerinden biridir.`;
  if (fertility >= 4) return `İl, verimli toprak yapısı sayesinde tarımsal faaliyetler için uygundur.`;
  if (fertility >= 3) return 'Orta seviye verimlilik ile belirli ürünlerin yetiştirilmesi mümkündür.';
  if (fertility >= 2) return 'Toprak verimliliği sınırlı olup tarım için özel teknikler gerekebilir.';
  return 'Toprak yapısı tarımsal üretim için elverişli değildir.';
}

function getRegionDescription(region) {
  const descriptions = {
    'Marmara': 'ekonomik ve sosyal açıdan en gelişmiş',
    'Ege': 'tarım ve turizm açısından önemli',
    'Akdeniz': 'turizm ve tarımda öne çıkan',
    'İç Anadolu': 'tahıl üretiminde lider',
    'Karadeniz': 'yağışlı ve yeşil',
    'Doğu Anadolu': 'dağlık yapısıyla bilinen',
    'Güneydoğu Anadolu': 'tarihî ve kültürel zenginliklere sahip'
  };
  return descriptions[region] || 'önemli';
}

loadProvinces();
