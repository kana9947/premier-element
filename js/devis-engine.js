/* ============================================
   PREMIER ELEMENT — Moteur de calcul devis
   3 demenageurs + camion — depart 8h fixe
   Facteurs: taille, etage, pauses, trafic
   ============================================ */

var DevisEngine = (function () {

  // --- Camp de base ---
  var CAMP_DE_BASE = {
    lat: 46.8155, lon: -71.2245,
    adresse: '20 rue Bigaouette, Quebec, QC'
  };

  // --- Heure de depart fixe ---
  var HEURE_DEPART = '08:00';
  var MAX_DEMENAGEMENTS_SIMULTANES = 3;

  // --- Temps de chargement par taille (minutes, RDC sans escalier) ---
  var TEMPS_BASE_TAILLE = {
    '1.5':        { chargement: 45,  dechargement: 35,  label: '1 1/2' },
    '2.5':        { chargement: 60,  dechargement: 50,  label: '2 1/2' },
    '3.5':        { chargement: 90,  dechargement: 70,  label: '3 1/2' },
    '4.5':        { chargement: 180, dechargement: 140, label: '4 1/2' },
    '5.5':        { chargement: 240, dechargement: 180, label: '5 1/2' },
    'maison':     { chargement: 270, dechargement: 200, label: 'Maison complete' },
    'commercial': { chargement: 200, dechargement: 160, label: 'Commercial' },
    'autre':      { chargement: 120, dechargement: 90,  label: 'Autre' }
  };

  // --- Multiplicateur par etage (sans ascenseur) ---
  var FACTEUR_ETAGE = {
    'rdc':    1.0,
    '2e':     1.30,
    '3e':     1.55,
    '4e':     1.80,
    'ascenseur': 1.05
  };

  // --- Facteur trafic selon l'heure ---
  var FACTEUR_TRAFIC = {
    heure_pointe_matin: 1.35,   // 7h-9h
    heure_normale: 1.0,         // 10h-15h
    heure_pointe_soir: 1.25,    // 15h-18h
    defaut: 1.15                // moyenne pour un demenagement qui dure toute la journee
  };

  // --- Pause obligatoire ---
  var PAUSE_PAR_HEURE = 15; // 15 min de pause par heure de chargement

  // --- TARIFS PAR DEFAUT ---
  var DEFAULT_TARIFS = {
    tauxHoraireBase: 125,
    nombreDemenageurs: 3,
    nombreCamions: 3,
    majorationWeekend: 20,
    majorationJuillet: 30,
    majorationFinMois: 10,
    heureFixeDeplacement: 1,
    seuilDeplacementMin: 30,
    vitesseMoyenne: 40,
    pauseParHeure: 15,
    facteurTrafic: 1.15,
    facteurEtage_rdc: 1.0,
    facteurEtage_2e: 1.30,
    facteurEtage_3e: 1.55,
    facteurEtage_4e: 1.80,
    facteurEtage_ascenseur: 1.05,
    temps_1_5_chargement: 45,   temps_1_5_dechargement: 35,
    temps_2_5_chargement: 60,   temps_2_5_dechargement: 50,
    temps_3_5_chargement: 90,   temps_3_5_dechargement: 70,
    temps_4_5_chargement: 180,  temps_4_5_dechargement: 140,
    temps_5_5_chargement: 240,  temps_5_5_dechargement: 180,
    temps_maison_chargement: 270,     temps_maison_dechargement: 200,
    temps_commercial_chargement: 200, temps_commercial_dechargement: 160,
    temps_autre_chargement: 120,      temps_autre_dechargement: 90,
    taxeTPS: 5,
    taxeTVQ: 9.975,
    devise: 'CAD',
    derniereMiseAJour: new Date().toISOString()
  };

  // --- Charger / Sauvegarder / Reinitialiser tarifs ---
  function chargerTarifs() {
    try {
      var saved = localStorage.getItem('pe_tarifs');
      if (saved) {
        var tarifs = JSON.parse(saved);
        for (var key in DEFAULT_TARIFS) {
          if (tarifs[key] === undefined) tarifs[key] = DEFAULT_TARIFS[key];
        }
        return tarifs;
      }
    } catch (e) { console.warn('Erreur chargement tarifs:', e); }
    return JSON.parse(JSON.stringify(DEFAULT_TARIFS));
  }

  function sauvegarderTarifs(tarifs) {
    tarifs.derniereMiseAJour = new Date().toISOString();
    localStorage.setItem('pe_tarifs', JSON.stringify(tarifs));
  }

  function reinitialiserTarifs() {
    localStorage.removeItem('pe_tarifs');
    return JSON.parse(JSON.stringify(DEFAULT_TARIFS));
  }

  // --- Temps par taille depuis tarifs ---
  function getTempsParTaille(taille, tarifs) {
    var k = taille.replace('.', '_');
    var ch = tarifs['temps_' + k + '_chargement'];
    var de = tarifs['temps_' + k + '_dechargement'];
    if (ch === undefined && TEMPS_BASE_TAILLE[taille]) ch = TEMPS_BASE_TAILLE[taille].chargement;
    if (de === undefined && TEMPS_BASE_TAILLE[taille]) de = TEMPS_BASE_TAILLE[taille].dechargement;
    return { chargement: ch || 120, dechargement: de || 90 };
  }

  // --- Facteur etage depuis tarifs ---
  function getFacteurEtage(etage, tarifs) {
    var f = tarifs['facteurEtage_' + etage];
    if (f !== undefined) return f;
    return FACTEUR_ETAGE[etage] || 1.0;
  }

  // --- Calculer pauses ---
  function calculerPauses(tempsMinutes, pauseParHeure) {
    var heures = tempsMinutes / 60;
    return Math.floor(heures) * pauseParHeure;
  }

  // --- Haversine ---
  function distanceHaversine(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function distanceRoute(distVol) { return distVol * 1.35; }

  // --- Geocodage ---
  function geocoderAdresse(adresse) {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' +
              encodeURIComponent(adresse + ', Quebec, Canada') + '&limit=1';
    return fetch(url, { headers: { 'Accept-Language': 'fr' } })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && data.length > 0)
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name, found: true };
      return { lat: 0, lon: 0, displayName: adresse, found: false };
    })
    .catch(function () { return { lat: 0, lon: 0, displayName: adresse, found: false }; });
  }

  // --- Optimisation nearest neighbor ---
  function optimiserRoute(points) {
    if (points.length <= 2) return points;
    var visited = [points[0]];
    var remaining = points.slice(1);
    while (remaining.length > 0) {
      var last = visited[visited.length - 1];
      var nearestIdx = 0, nearestDist = Infinity;
      for (var i = 0; i < remaining.length; i++) {
        var d = distanceHaversine(last.lat, last.lon, remaining[i].lat, remaining[i].lon);
        if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
      }
      visited.push(remaining[nearestIdx]);
      remaining.splice(nearestIdx, 1);
    }
    return visited;
  }

  function calculerDistanceTotale(points) {
    var total = 0;
    for (var i = 0; i < points.length - 1; i++)
      total += distanceRoute(distanceHaversine(points[i].lat, points[i].lon, points[i+1].lat, points[i+1].lon));
    return total;
  }

  // --- Distance depuis base ---
  function calculerTempsDepuisBase(adresse, tarifs) {
    var dVol = distanceHaversine(CAMP_DE_BASE.lat, CAMP_DE_BASE.lon, adresse.lat, adresse.lon);
    var dRoute = distanceRoute(dVol);
    var tempsMin = (dRoute / tarifs.vitesseMoyenne) * 60;
    return { distanceKm: Math.round(dRoute * 10) / 10, tempsMin: Math.round(tempsMin) };
  }

  // --- Majorations ---
  function calculerMajorations(dateStr, tarifs) {
    var date = new Date(dateStr + 'T12:00:00');
    var jour = date.getDay(), mois = date.getMonth(), jourMois = date.getDate();
    var dernierJour = new Date(date.getFullYear(), mois + 1, 0).getDate();
    var majorations = [], totalMajoration = 0;

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

  // === CALCUL PRINCIPAL DU DEVIS ===
  function calculerDevis(params) {
    var tarifs = chargerTarifs();

    // 1. Route optimisee
    var tousPoints = [];
    params.adressesRamassage.forEach(function (a) {
      tousPoints.push({ lat: a.lat, lon: a.lon, type: 'ramassage', adresse: a.adresse });
    });
    params.adressesDepot.forEach(function (a) {
      tousPoints.push({ lat: a.lat, lon: a.lon, type: 'depot', adresse: a.adresse });
    });
    var routeOptimisee = optimiserRoute(tousPoints);
    var distanceKm = Math.round(calculerDistanceTotale(routeOptimisee) * 10) / 10;

    // 2. Temps route avec facteur trafic
    var facteurTrafic = tarifs.facteurTrafic || FACTEUR_TRAFIC.defaut;
    var tempsRouteMin = ((distanceKm / tarifs.vitesseMoyenne) * 60) * facteurTrafic;

    // 3. Temps chargement/dechargement selon taille
    var tempsBase = getTempsParTaille(params.tailleLogement, tarifs);

    // 4. Appliquer facteur etage
    var facteurEtageRamassage = getFacteurEtage(params.etageRamassage, tarifs);
    var facteurEtageDepot = getFacteurEtage(params.etageDepot, tarifs);

    var tempsChargementBrut = tempsBase.chargement * facteurEtageRamassage * params.adressesRamassage.length;
    var tempsDechargementBrut = tempsBase.dechargement * facteurEtageDepot * params.adressesDepot.length;

    // 5. Ajouter pauses (15 min par heure de manutention)
    var pauseParH = tarifs.pauseParHeure || PAUSE_PAR_HEURE;
    var pausesChargement = calculerPauses(tempsChargementBrut, pauseParH);
    var pausesDechargement = calculerPauses(tempsDechargementBrut, pauseParH);

    var tempsChargementTotal = Math.round(tempsChargementBrut + pausesChargement);
    var tempsDechargementTotal = Math.round(tempsDechargementBrut + pausesDechargement);
    var totalPauses = pausesChargement + pausesDechargement;

    // 6. Deplacement depuis le camp de base
    var premiereAdresse = params.adressesRamassage[0];
    var infoBase = calculerTempsDepuisBase(premiereAdresse, tarifs);
    var deplacementHorsVille = infoBase.tempsMin > tarifs.seuilDeplacementMin;
    var tempsDeplacementMin = deplacementHorsVille
      ? (infoBase.tempsMin * facteurTrafic) * 2
      : tarifs.heureFixeDeplacement * 60;

    // 7. Temps total
    var tempsTravailMin = tempsRouteMin + tempsChargementTotal + tempsDechargementTotal;
    var tempsTravailHeures = Math.ceil(tempsTravailMin / 30) / 2;
    var tempsDeplacementHeures = Math.ceil(tempsDeplacementMin / 30) / 2;
    var tempsTotalHeures = tempsTravailHeures + tempsDeplacementHeures;

    // 8. Estimer heure de fin
    var heureFinMin = (8 * 60) + (tempsTotalHeures * 60);
    var heureFin = Math.floor(heureFinMin / 60) + ':' + String(Math.round(heureFinMin % 60)).padStart(2, '0');

    // 9. Majorations
    var infoMajorations = calculerMajorations(params.date, tarifs);
    var tauxEffectif = tarifs.tauxHoraireBase + infoMajorations.totalMajoration;

    // 10. Couts
    var coutDeplacement = tempsDeplacementHeures * tauxEffectif;
    var coutTravail = tempsTravailHeures * tauxEffectif;
    var sousTotal = coutDeplacement + coutTravail;
    var tps = sousTotal * (tarifs.taxeTPS / 100);
    var tvq = sousTotal * (tarifs.taxeTVQ / 100);
    var total = sousTotal + tps + tvq;

    var labelTaille = TEMPS_BASE_TAILLE[params.tailleLogement]
      ? TEMPS_BASE_TAILLE[params.tailleLogement].label : params.tailleLogement;

    var labelsEtage = {
      'rdc': 'Rez-de-chaussee', '2e': '2e etage (sans ascenseur)',
      '3e': '3e etage (sans ascenseur)', '4e': '4e etage+ (sans ascenseur)',
      'ascenseur': 'Avec ascenseur'
    };

    return {
      routeOptimisee: routeOptimisee,
      distanceKm: distanceKm,
      nbAdressesRamassage: params.adressesRamassage.length,
      nbAdressesDepot: params.adressesDepot.length,
      tailleLogement: labelTaille,
      etageRamassage: labelsEtage[params.etageRamassage] || params.etageRamassage,
      etageDepot: labelsEtage[params.etageDepot] || params.etageDepot,
      facteurEtageRamassage: facteurEtageRamassage,
      facteurEtageDepot: facteurEtageDepot,
      distanceDepuisBase: infoBase.distanceKm,
      tempsDepuisBaseMin: infoBase.tempsMin,
      deplacementHorsVille: deplacementHorsVille,
      facteurTrafic: facteurTrafic,
      tempsRouteMin: Math.round(tempsRouteMin),
      tempsChargementMin: tempsChargementTotal,
      tempsDechargementMin: tempsDechargementTotal,
      totalPausesMin: Math.round(totalPauses),
      tempsDeplacementMin: Math.round(tempsDeplacementMin),
      tempsDeplacementHeures: tempsDeplacementHeures,
      tempsTravailHeures: tempsTravailHeures,
      tempsTotalHeures: tempsTotalHeures,
      heureDepart: '08:00',
      heureFinEstimee: heureFin,
      tauxHoraireBase: tarifs.tauxHoraireBase,
      nombreDemenageurs: tarifs.nombreDemenageurs,
      majorations: infoMajorations.majorations,
      tauxEffectif: tauxEffectif,
      coutDeplacement: Math.round(coutDeplacement * 100) / 100,
      coutTravail: Math.round(coutTravail * 100) / 100,
      sousTotal: Math.round(sousTotal * 100) / 100,
      tps: Math.round(tps * 100) / 100,
      tvq: Math.round(tvq * 100) / 100,
      total: Math.round(total * 100) / 100,
      date: params.date,
      heure: '08:00'
    };
  }

  // === SYSTEME DE RESERVATIONS ===
  function chargerReservations() {
    try {
      var saved = localStorage.getItem('pe_reservations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  }

  function sauvegarderReservations(reservations) {
    localStorage.setItem('pe_reservations', JSON.stringify(reservations));
  }

  function soumettreReservation(devis, clientInfo) {
    var reservations = chargerReservations();
    var reservation = {
      id: 'RES-' + Date.now(),
      dateCreation: new Date().toISOString(),
      statut: 'en_attente', // en_attente, approuve, refuse
      client: clientInfo,
      date: devis.date,
      heureDepart: '08:00',
      heureFinEstimee: devis.heureFinEstimee,
      tailleLogement: devis.tailleLogement,
      etageRamassage: devis.etageRamassage,
      etageDepot: devis.etageDepot,
      nbAdressesRamassage: devis.nbAdressesRamassage,
      nbAdressesDepot: devis.nbAdressesDepot,
      distanceKm: devis.distanceKm,
      tempsTotalHeures: devis.tempsTotalHeures,
      total: devis.total,
      sousTotal: devis.sousTotal,
      tps: devis.tps,
      tvq: devis.tvq,
      tauxEffectif: devis.tauxEffectif
    };
    reservations.push(reservation);
    sauvegarderReservations(reservations);
    return reservation;
  }

  function verifierDisponibilite(dateStr) {
    var tarifs = chargerTarifs();
    var maxSimultanes = tarifs.nombreCamions || MAX_DEMENAGEMENTS_SIMULTANES;
    var reservations = chargerReservations();
    var approuves = reservations.filter(function (r) {
      return r.date === dateStr && r.statut === 'approuve';
    });
    return {
      placesTotal: maxSimultanes,
      placesOccupees: approuves.length,
      placesDisponibles: Math.max(0, maxSimultanes - approuves.length),
      disponible: approuves.length < maxSimultanes
    };
  }

  function approuverReservation(reservationId) {
    var reservations = chargerReservations();
    for (var i = 0; i < reservations.length; i++) {
      if (reservations[i].id === reservationId) {
        var dispo = verifierDisponibilite(reservations[i].date);
        if (!dispo.disponible) return { success: false, message: 'Plus de place pour cette date' };
        reservations[i].statut = 'approuve';
        reservations[i].dateApprobation = new Date().toISOString();
        sauvegarderReservations(reservations);
        return { success: true, reservation: reservations[i] };
      }
    }
    return { success: false, message: 'Reservation non trouvee' };
  }

  function refuserReservation(reservationId) {
    var reservations = chargerReservations();
    for (var i = 0; i < reservations.length; i++) {
      if (reservations[i].id === reservationId) {
        reservations[i].statut = 'refuse';
        sauvegarderReservations(reservations);
        return { success: true };
      }
    }
    return { success: false };
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
    getFacteurEtage: getFacteurEtage,
    chargerReservations: chargerReservations,
    soumettreReservation: soumettreReservation,
    verifierDisponibilite: verifierDisponibilite,
    approuverReservation: approuverReservation,
    refuserReservation: refuserReservation,
    CAMP_DE_BASE: CAMP_DE_BASE,
    HEURE_DEPART: HEURE_DEPART,
    MAX_DEMENAGEMENTS_SIMULTANES: MAX_DEMENAGEMENTS_SIMULTANES,
    TEMPS_BASE_TAILLE: TEMPS_BASE_TAILLE,
    FACTEUR_ETAGE: FACTEUR_ETAGE,
    DEFAULT_TARIFS: DEFAULT_TARIFS
  };
})();
