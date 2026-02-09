/* ============================================
   PREMIER ELEMENT — Moteur de calcul devis
   Estimation demenagement : distances + couts
   3 demenageurs + camion — toujours
   ============================================ */

var DevisEngine = (function () {

  // --- Camp de base (20 rue Bigaouette, Quebec) ---
  var CAMP_DE_BASE = {
    lat: 46.8155,
    lon: -71.2245,
    adresse: '20 rue Bigaouette, Quebec, QC'
  };

  // --- Temps de chargement/dechargement par taille de logement (minutes) ---
  var TEMPS_PAR_TAILLE = {
    '1.5':        { chargement: 30,  dechargement: 25,  label: '1 1/2' },
    '2.5':        { chargement: 45,  dechargement: 35,  label: '2 1/2' },
    '3.5':        { chargement: 70,  dechargement: 55,  label: '3 1/2' },
    '4.5':        { chargement: 100, dechargement: 75,  label: '4 1/2' },
    '5.5':        { chargement: 130, dechargement: 100, label: '5 1/2' },
    'maison':     { chargement: 180, dechargement: 140, label: 'Maison complete' },
    'commercial': { chargement: 150, dechargement: 120, label: 'Commercial' },
    'autre':      { chargement: 90,  dechargement: 70,  label: 'Autre' }
  };

  // --- TARIFS PAR DEFAUT (modifiables via admin) ---
  var DEFAULT_TARIFS = {
    tauxHoraireBase: 125,         // $/heure (3 demenageurs + camion)
    nombreDemenageurs: 3,         // toujours 3
    majorationWeekend: 20,        // $/heure en plus sam/dim
    majorationJuillet: 30,        // $/heure en plus 25 juin - 7 juillet
    majorationFinMois: 10,        // $/heure en plus derniers 3 jours du mois
    heureFixeDeplacement: 1,      // 1h fixe toujours facturee (deplacement de base)
    seuilDeplacementMin: 30,      // seuil en minutes depuis le camp de base
    vitesseMoyenne: 40,           // km/h en ville (pour estimer le temps)
    taxeTPS: 5,                   // % TPS
    taxeTVQ: 9.975,               // % TVQ
    // Temps par taille de logement (modifiables via admin)
    temps_1_5_chargement: 30,
    temps_1_5_dechargement: 25,
    temps_2_5_chargement: 45,
    temps_2_5_dechargement: 35,
    temps_3_5_chargement: 70,
    temps_3_5_dechargement: 55,
    temps_4_5_chargement: 100,
    temps_4_5_dechargement: 75,
    temps_5_5_chargement: 130,
    temps_5_5_dechargement: 100,
    temps_maison_chargement: 180,
    temps_maison_dechargement: 140,
    temps_commercial_chargement: 150,
    temps_commercial_dechargement: 120,
    temps_autre_chargement: 90,
    temps_autre_dechargement: 70,
    devise: 'CAD',
    derniereMiseAJour: new Date().toISOString()
  };

  // --- Charger les tarifs (localStorage ou defaut) ---
  function chargerTarifs() {
    try {
      var saved = localStorage.getItem('pe_tarifs');
      if (saved) {
        var tarifs = JSON.parse(saved);
        for (var key in DEFAULT_TARIFS) {
          if (tarifs[key] === undefined) {
            tarifs[key] = DEFAULT_TARIFS[key];
          }
        }
        return tarifs;
      }
    } catch (e) {
      console.warn('Erreur chargement tarifs, utilisation des defauts:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_TARIFS));
  }

  // --- Sauvegarder / Reinitialiser ---
  function sauvegarderTarifs(tarifs) {
    tarifs.derniereMiseAJour = new Date().toISOString();
    localStorage.setItem('pe_tarifs', JSON.stringify(tarifs));
  }

  function reinitialiserTarifs() {
    localStorage.removeItem('pe_tarifs');
    return JSON.parse(JSON.stringify(DEFAULT_TARIFS));
  }

  // --- Obtenir les temps chargement/dechargement selon taille ---
  function getTempsParTaille(tailleLogement, tarifs) {
    var keyBase = tailleLogement.replace('.', '_');
    var chargement = tarifs['temps_' + keyBase + '_chargement'];
    var dechargement = tarifs['temps_' + keyBase + '_dechargement'];
    // Fallback vers les valeurs codees si pas dans tarifs
    if (chargement === undefined && TEMPS_PAR_TAILLE[tailleLogement]) {
      chargement = TEMPS_PAR_TAILLE[tailleLogement].chargement;
    }
    if (dechargement === undefined && TEMPS_PAR_TAILLE[tailleLogement]) {
      dechargement = TEMPS_PAR_TAILLE[tailleLogement].dechargement;
    }
    return {
      chargement: chargement || 90,
      dechargement: dechargement || 70
    };
  }

  // --- Haversine ---
  function distanceHaversine(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function distanceRoute(distVol) {
    return distVol * 1.35;
  }

  // --- Geocodage Nominatim ---
  function geocoderAdresse(adresse) {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' +
              encodeURIComponent(adresse + ', Quebec, Canada') + '&limit=1';
    return fetch(url, { headers: { 'Accept-Language': 'fr' } })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name, found: true };
      }
      return { lat: 0, lon: 0, displayName: adresse, found: false };
    })
    .catch(function () {
      return { lat: 0, lon: 0, displayName: adresse, found: false };
    });
  }

  // --- Optimisation nearest neighbor ---
  function optimiserRoute(points) {
    if (points.length <= 2) return points;
    var visited = [points[0]];
    var remaining = points.slice(1);
    while (remaining.length > 0) {
      var last = visited[visited.length - 1];
      var nearestIdx = 0;
      var nearestDist = Infinity;
      for (var i = 0; i < remaining.length; i++) {
        var d = distanceHaversine(last.lat, last.lon, remaining[i].lat, remaining[i].lon);
        if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
      }
      visited.push(remaining[nearestIdx]);
      remaining.splice(nearestIdx, 1);
    }
    return visited;
  }

  // --- Distance totale itineraire ---
  function calculerDistanceTotale(points) {
    var totalKm = 0;
    for (var i = 0; i < points.length - 1; i++) {
      var dVol = distanceHaversine(points[i].lat, points[i].lon, points[i + 1].lat, points[i + 1].lon);
      totalKm += distanceRoute(dVol);
    }
    return totalKm;
  }

  // --- Calculer le temps depuis le camp de base vers la premiere adresse ---
  function calculerTempsDepuisBase(premiereAdresse, tarifs) {
    var dVol = distanceHaversine(CAMP_DE_BASE.lat, CAMP_DE_BASE.lon, premiereAdresse.lat, premiereAdresse.lon);
    var dRoute = distanceRoute(dVol);
    var tempsMin = (dRoute / tarifs.vitesseMoyenne) * 60;
    return {
      distanceKm: Math.round(dRoute * 10) / 10,
      tempsMin: Math.round(tempsMin)
    };
  }

  // --- Majorations selon la date ---
  function calculerMajorations(dateStr, tarifs) {
    var date = new Date(dateStr + 'T12:00:00');
    var jour = date.getDay();
    var mois = date.getMonth();
    var jourMois = date.getDate();
    var dernierJour = new Date(date.getFullYear(), mois + 1, 0).getDate();

    var majorations = [];
    var totalMajoration = 0;

    if (jour === 0 || jour === 6) {
      majorations.push({ label: 'Majoration fin de semaine', montant: tarifs.majorationWeekend });
      totalMajoration += tarifs.majorationWeekend;
    }
    if ((mois === 5 && jourMois >= 25) || (mois === 6 && jourMois <= 7)) {
      majorations.push({ label: 'Majoration periode 1er juillet', montant: tarifs.majorationJuillet });
      totalMajoration += tarifs.majorationJuillet;
    }
    if (jourMois >= dernierJour - 2) {
      majorations.push({ label: 'Majoration fin de mois', montant: tarifs.majorationFinMois });
      totalMajoration += tarifs.majorationFinMois;
    }

    return { majorations: majorations, totalMajoration: totalMajoration };
  }

  // --- CALCUL PRINCIPAL DU DEVIS ---
  function calculerDevis(params) {
    /*
      params = {
        adressesRamassage: [{adresse, lat, lon}, ...],
        adressesDepot: [{adresse, lat, lon}, ...],
        tailleLogement: '1.5' | '2.5' | ... | 'maison' | 'commercial' | 'autre',
        date: 'YYYY-MM-DD',
        heure: 'HH:MM'
      }
    */
    var tarifs = chargerTarifs();

    // 1. Construire l'itineraire
    var tousPoints = [];
    params.adressesRamassage.forEach(function (a) {
      tousPoints.push({ lat: a.lat, lon: a.lon, type: 'ramassage', adresse: a.adresse });
    });
    params.adressesDepot.forEach(function (a) {
      tousPoints.push({ lat: a.lat, lon: a.lon, type: 'depot', adresse: a.adresse });
    });

    // 2. Optimiser la route
    var routeOptimisee = optimiserRoute(tousPoints);

    // 3. Distance totale entre les arrets
    var distanceKm = calculerDistanceTotale(routeOptimisee);
    distanceKm = Math.round(distanceKm * 10) / 10;

    // 4. Temps route entre arrets
    var tempsRouteMin = (distanceKm / tarifs.vitesseMoyenne) * 60;

    // 5. Temps chargement/dechargement selon taille du logement
    var tempsLogement = getTempsParTaille(params.tailleLogement, tarifs);
    var tempsChargementTotal = tempsLogement.chargement * params.adressesRamassage.length;
    var tempsDechargementTotal = tempsLogement.dechargement * params.adressesDepot.length;

    // 6. Calcul deplacement depuis le camp de base
    var premiereAdresse = params.adressesRamassage[0];
    var infoBase = calculerTempsDepuisBase(premiereAdresse, tarifs);
    var deplacementHorsVille = infoBase.tempsMin > tarifs.seuilDeplacementMin;

    // Heure fixe de deplacement (toujours 1h minimum)
    // Si hors ville (> seuil), on facture le temps reel aller-retour
    var tempsDeplacementMin;
    if (deplacementHorsVille) {
      tempsDeplacementMin = infoBase.tempsMin * 2; // aller-retour
    } else {
      tempsDeplacementMin = tarifs.heureFixeDeplacement * 60; // 1h fixe
    }

    // 7. Temps total de travail (chargement + route + dechargement)
    var tempsTravailMin = tempsRouteMin + tempsChargementTotal + tempsDechargementTotal;
    var tempsTravailHeures = Math.ceil(tempsTravailMin / 30) / 2; // arrondir au 0.5h

    // Temps deplacement en heures
    var tempsDeplacementHeures = Math.ceil(tempsDeplacementMin / 30) / 2;

    // Total heures facturees
    var tempsTotalHeures = tempsTravailHeures + tempsDeplacementHeures;

    // 8. Majorations selon la date
    var infoMajorations = calculerMajorations(params.date, tarifs);
    var tauxEffectif = tarifs.tauxHoraireBase + infoMajorations.totalMajoration;

    // 9. Calcul des couts
    var coutDeplacement = tempsDeplacementHeures * tauxEffectif;
    var coutTravail = tempsTravailHeures * tauxEffectif;
    var sousTotal = coutDeplacement + coutTravail;

    // 10. Taxes
    var tps = sousTotal * (tarifs.taxeTPS / 100);
    var tvq = sousTotal * (tarifs.taxeTVQ / 100);
    var total = sousTotal + tps + tvq;

    // Label taille logement
    var labelTaille = TEMPS_PAR_TAILLE[params.tailleLogement]
      ? TEMPS_PAR_TAILLE[params.tailleLogement].label
      : params.tailleLogement;

    return {
      // Itineraire
      routeOptimisee: routeOptimisee,
      distanceKm: distanceKm,
      nbAdressesRamassage: params.adressesRamassage.length,
      nbAdressesDepot: params.adressesDepot.length,

      // Logement
      tailleLogement: labelTaille,

      // Camp de base
      distanceDepuisBase: infoBase.distanceKm,
      tempsDepuisBaseMin: infoBase.tempsMin,
      deplacementHorsVille: deplacementHorsVille,

      // Temps
      tempsRouteMin: Math.round(tempsRouteMin),
      tempsChargementMin: tempsChargementTotal,
      tempsDechargementMin: tempsDechargementTotal,
      tempsDeplacementMin: Math.round(tempsDeplacementMin),
      tempsDeplacementHeures: tempsDeplacementHeures,
      tempsTravailHeures: tempsTravailHeures,
      tempsTotalHeures: tempsTotalHeures,

      // Tarifs
      tauxHoraireBase: tarifs.tauxHoraireBase,
      nombreDemenageurs: tarifs.nombreDemenageurs,
      majorations: infoMajorations.majorations,
      tauxEffectif: tauxEffectif,

      // Couts
      coutDeplacement: Math.round(coutDeplacement * 100) / 100,
      coutTravail: Math.round(coutTravail * 100) / 100,
      sousTotal: Math.round(sousTotal * 100) / 100,
      tps: Math.round(tps * 100) / 100,
      tvq: Math.round(tvq * 100) / 100,
      total: Math.round(total * 100) / 100,

      // Meta
      date: params.date,
      heure: params.heure
    };
  }

  return {
    chargerTarifs: chargerTarifs,
    sauvegarderTarifs: sauvegarderTarifs,
    reinitialiserTarifs: reinitialiserTarifs,
    geocoderAdresse: geocoderAdresse,
    calculerDevis: calculerDevis,
    optimiserRoute: optimiserRoute,
    calculerDistanceTotale: calculerDistanceTotale,
    calculerTempsDepuisBase: calculerTempsDepuisBase,
    getTempsParTaille: getTempsParTaille,
    CAMP_DE_BASE: CAMP_DE_BASE,
    TEMPS_PAR_TAILLE: TEMPS_PAR_TAILLE,
    DEFAULT_TARIFS: DEFAULT_TARIFS
  };

})();
