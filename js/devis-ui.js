/* ============================================
   PREMIER ELEMENT — UI Estimateur demenagement
   Gestion des etapes, formulaires, affichage
   Depart fixe 8h — Etages — Soumission
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  var currentStep = 1;
  var pickupCount = 1;
  var dropoffCount = 1;
  var dernierDevis = null; // stocke le dernier devis calcule

  // --- Navigation entre etapes ---
  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll('.step-panel').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('step' + step).classList.add('active');
    document.querySelectorAll('.step-indicator').forEach(function (s) {
      var sNum = parseInt(s.getAttribute('data-step'));
      s.classList.remove('active', 'done');
      if (sNum === step) s.classList.add('active');
      if (sNum < step) s.classList.add('done');
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  // --- Toggle "Autre" description ---
  document.querySelectorAll('input[name="tailleLogement"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var autreDesc = document.getElementById('autreDescription');
      if (this.value === 'autre') {
        autreDesc.classList.add('visible');
      } else {
        autreDesc.classList.remove('visible');
      }
    });
  });

  // --- Ajouter adresse de ramassage ---
  document.getElementById('addPickup').addEventListener('click', function () {
    pickupCount++;
    var html = '<div class="address-group" data-index="' + (pickupCount - 1) + '">' +
      '<div class="group-header"><div>' +
      '<span class="group-number">' + pickupCount + '</span>' +
      '<span class="group-title">Adresse de ramassage</span>' +
      '</div>' +
      '<button type="button" class="btn-remove remove-pickup">Supprimer</button>' +
      '</div>' +
      '<div class="form-group" style="margin-bottom:12px;">' +
      '<input type="text" class="pickup-address" placeholder="Adresse complete avec code postal">' +
      '</div>' +
      '<div class="etage-select">' +
      '<label>Etage du logement</label>' +
      '<select class="pickup-etage">' +
      '<option value="rdc">Rez-de-chaussee</option>' +
      '<option value="2e">2e etage (sans ascenseur)</option>' +
      '<option value="3e">3e etage (sans ascenseur)</option>' +
      '<option value="4e">4e etage et + (sans ascenseur)</option>' +
      '<option value="ascenseur">Avec ascenseur</option>' +
      '</select></div>' +
      '<div class="address-status" data-for="pickup-' + (pickupCount - 1) + '"></div>' +
      '</div>';
    document.getElementById('pickupList').insertAdjacentHTML('beforeend', html);
  });

  // --- Ajouter adresse de depot ---
  document.getElementById('addDropoff').addEventListener('click', function () {
    dropoffCount++;
    var html = '<div class="address-group" data-index="' + (dropoffCount - 1) + '">' +
      '<div class="group-header"><div>' +
      '<span class="group-number" style="background:var(--menage);">' + dropoffCount + '</span>' +
      '<span class="group-title">Adresse de depot</span>' +
      '</div>' +
      '<button type="button" class="btn-remove remove-dropoff">Supprimer</button>' +
      '</div>' +
      '<div class="form-group" style="margin-bottom:12px;">' +
      '<input type="text" class="dropoff-address" placeholder="Adresse complete avec code postal">' +
      '</div>' +
      '<div class="etage-select">' +
      '<label>Etage du logement</label>' +
      '<select class="dropoff-etage">' +
      '<option value="rdc">Rez-de-chaussee</option>' +
      '<option value="2e">2e etage (sans ascenseur)</option>' +
      '<option value="3e">3e etage (sans ascenseur)</option>' +
      '<option value="4e">4e etage et + (sans ascenseur)</option>' +
      '<option value="ascenseur">Avec ascenseur</option>' +
      '</select></div>' +
      '<div class="address-status" data-for="dropoff-' + (dropoffCount - 1) + '"></div>' +
      '</div>';
    document.getElementById('dropoffList').insertAdjacentHTML('beforeend', html);
  });

  // --- Supprimer adresse ---
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-pickup')) {
      e.target.closest('.address-group').remove();
      renumeriserGroupes('pickupList');
    }
    if (e.target.classList.contains('remove-dropoff')) {
      e.target.closest('.address-group').remove();
      renumeriserGroupes('dropoffList');
    }
  });

  function renumeriserGroupes(listId) {
    var groups = document.getElementById(listId).querySelectorAll('.address-group');
    groups.forEach(function (g, i) {
      g.querySelector('.group-number').textContent = i + 1;
    });
  }

  // --- Date minimum ---
  var dateInput = document.getElementById('devisDate');
  if (dateInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
    dateInput.addEventListener('change', function () {
      afficherInfoDate(this.value);
      verifierDispo(this.value);
    });
  }

  // --- Afficher info date ---
  function afficherInfoDate(dateStr) {
    var dateInfo = document.getElementById('dateInfo');
    var tagsEl = document.getElementById('dateInfoTags');
    var textEl = document.getElementById('dateInfoText');

    if (!dateStr) { dateInfo.classList.remove('visible'); return; }

    var tarifs = DevisEngine.chargerTarifs();
    var date = new Date(dateStr + 'T12:00:00');
    var jour = date.getDay();
    var mois = date.getMonth();
    var jourMois = date.getDate();
    var dernierJour = new Date(date.getFullYear(), mois + 1, 0).getDate();

    var tags = [];
    var tauxTotal = tarifs.tauxHoraireBase;
    var jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var moisNoms = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];

    if (jour === 0 || jour === 6) {
      tags.push('Fin de semaine (+' + tarifs.majorationWeekend + '$/h)');
      tauxTotal += tarifs.majorationWeekend;
    }
    if ((mois === 5 && jourMois >= 25) || (mois === 6 && jourMois <= 7)) {
      tags.push('Periode 1er juillet (+' + tarifs.majorationJuillet + '$/h)');
      tauxTotal += tarifs.majorationJuillet;
    }
    if (jourMois >= dernierJour - 2) {
      tags.push('Fin de mois (+' + tarifs.majorationFinMois + '$/h)');
      tauxTotal += tarifs.majorationFinMois;
    }

    tagsEl.innerHTML = '';
    tags.forEach(function (t) {
      tagsEl.innerHTML += '<span class="tag">' + t + '</span>';
    });

    var dateFormatee = jours[jour] + ' ' + jourMois + ' ' + moisNoms[mois] + ' ' + date.getFullYear();
    textEl.textContent = dateFormatee + ' — Taux horaire effectif : ' + tauxTotal + '$/h (3 demenageurs + camion)';
    dateInfo.classList.add('visible');
  }

  // --- Verifier disponibilite ---
  function verifierDispo(dateStr) {
    var dispoEl = document.getElementById('dispoInfo');
    if (!dateStr) { dispoEl.classList.remove('visible'); return; }

    var dispo = DevisEngine.verifierDisponibilite(dateStr);
    dispoEl.classList.remove('dispo-ok', 'dispo-full');
    dispoEl.classList.add('visible');

    if (dispo.disponible) {
      dispoEl.classList.add('dispo-ok');
      dispoEl.textContent = 'Disponible — ' + dispo.placesDisponibles + ' place(s) restante(s) sur ' + dispo.placesTotal + ' pour cette date.';
    } else {
      dispoEl.classList.add('dispo-full');
      dispoEl.textContent = 'Complet — Les ' + dispo.placesTotal + ' camions sont deja reserves pour cette date. Veuillez choisir une autre date.';
    }
  }

  // --- Navigation boutons ---
  document.getElementById('toStep2').addEventListener('click', function () {
    var pickups = document.querySelectorAll('.pickup-address');
    var dropoffs = document.querySelectorAll('.dropoff-address');
    var valid = true;

    // Valider taille logement
    var tailleChoisie = document.querySelector('input[name="tailleLogement"]:checked');
    if (!tailleChoisie) {
      valid = false;
    }

    pickups.forEach(function (input) {
      if (!input.value.trim()) { input.style.borderColor = 'var(--error)'; valid = false; }
      else { input.style.borderColor = ''; }
    });
    dropoffs.forEach(function (input) {
      if (!input.value.trim()) { input.style.borderColor = 'var(--error)'; valid = false; }
      else { input.style.borderColor = ''; }
    });

    if (valid) goToStep(2);
  });

  document.getElementById('backToStep1').addEventListener('click', function () { goToStep(1); });
  document.getElementById('backToStep2').addEventListener('click', function () { goToStep(2); });

  // --- CALCUL DU DEVIS ---
  document.getElementById('toStep3').addEventListener('click', function () {
    var dateVal = document.getElementById('devisDate').value;

    if (!dateVal) { document.getElementById('devisDate').style.borderColor = 'var(--error)'; return; }
    document.getElementById('devisDate').style.borderColor = '';

    goToStep(3);

    document.getElementById('loadingSpinner').classList.add('visible');
    document.getElementById('resultatContainer').style.display = 'none';

    // Collecter taille logement
    var tailleRadio = document.querySelector('input[name="tailleLogement"]:checked');
    var tailleLogement = tailleRadio ? tailleRadio.value : '3.5';

    // Collecter etage (on prend le premier de chaque type comme reference principale)
    var pickupEtageEl = document.querySelector('.pickup-etage');
    var dropoffEtageEl = document.querySelector('.dropoff-etage');
    var etageRamassage = pickupEtageEl ? pickupEtageEl.value : 'rdc';
    var etageDepot = dropoffEtageEl ? dropoffEtageEl.value : 'rdc';

    // Collecter adresses
    var pickupInputs = document.querySelectorAll('.pickup-address');
    var dropoffInputs = document.querySelectorAll('.dropoff-address');
    var geocodePromises = [];
    var pickupAddresses = [];
    var dropoffAddresses = [];

    pickupInputs.forEach(function (input) {
      var addr = input.value.trim();
      if (addr) {
        var p = DevisEngine.geocoderAdresse(addr).then(function (result) {
          pickupAddresses.push({ adresse: addr, lat: result.lat, lon: result.lon, found: result.found });
        });
        geocodePromises.push(p);
      }
    });

    dropoffInputs.forEach(function (input) {
      var addr = input.value.trim();
      if (addr) {
        var p = DevisEngine.geocoderAdresse(addr).then(function (result) {
          dropoffAddresses.push({ adresse: addr, lat: result.lat, lon: result.lon, found: result.found });
        });
        geocodePromises.push(p);
      }
    });

    Promise.all(geocodePromises).then(function () {
      var devis = DevisEngine.calculerDevis({
        adressesRamassage: pickupAddresses,
        adressesDepot: dropoffAddresses,
        tailleLogement: tailleLogement,
        etageRamassage: etageRamassage,
        etageDepot: etageDepot,
        date: dateVal,
        heure: '08:00'
      });
      dernierDevis = devis;
      afficherResultat(devis);
    }).catch(function (err) {
      console.error('Erreur calcul devis:', err);
      document.getElementById('loadingSpinner').classList.remove('visible');
    });
  });

  // --- Afficher le resultat ---
  function afficherResultat(devis) {
    document.getElementById('loadingSpinner').classList.remove('visible');
    document.getElementById('resultatContainer').style.display = 'block';

    // Cacher le formulaire de soumission, montrer le formulaire
    document.getElementById('soumissionForm').style.display = 'block';
    document.getElementById('soumissionSuccess').classList.remove('visible');

    function fmt(n) { return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' $'; }

    // Total
    document.getElementById('totalMontant').textContent = devis.total.toFixed(2);

    // Details
    document.getElementById('resTaille').textContent = devis.tailleLogement;
    document.getElementById('resEquipe').textContent = devis.nombreDemenageurs + ' demenageurs + camion';
    document.getElementById('resEtageRamassage').textContent = devis.etageRamassage;
    document.getElementById('resEtageDepot').textContent = devis.etageDepot;
    document.getElementById('resDistance').textContent = devis.distanceKm + ' km';
    document.getElementById('resPickups').textContent = devis.nbAdressesRamassage;
    document.getElementById('resDropoffs').textContent = devis.nbAdressesDepot;

    // Temps
    document.getElementById('resTempsCharg').textContent = devis.tempsChargementMin + ' min';
    document.getElementById('resTempsRoute').textContent = devis.tempsRouteMin + ' min';
    document.getElementById('resTempsDecharg').textContent = devis.tempsDechargementMin + ' min';
    document.getElementById('resPauses').textContent = devis.totalPausesMin + ' min';
    document.getElementById('resTempsTravail').textContent = devis.tempsTravailHeures + ' h';

    // Horaire
    document.getElementById('resHeureDepart').textContent = devis.heureDepart;
    document.getElementById('resHeureFin').textContent = devis.heureFinEstimee;

    // Deplacement depuis base
    document.getElementById('resDistBase').textContent = devis.distanceDepuisBase + ' km';
    document.getElementById('resTempsBase').textContent = devis.tempsDepuisBaseMin + ' min';
    document.getElementById('resFacteurTrafic').textContent = 'x' + devis.facteurTrafic;

    if (devis.deplacementHorsVille) {
      document.getElementById('resDeplacementLabel').textContent = 'Deplacement hors zone (aller-retour)';
      document.getElementById('resDeplacementHeures').textContent = devis.tempsDeplacementHeures + ' h';
      document.getElementById('ligneDeplacementType').style.color = 'var(--demenagement)';
    } else {
      document.getElementById('resDeplacementLabel').textContent = 'Deplacement fixe (en ville)';
      document.getElementById('resDeplacementHeures').textContent = '1 h (forfait)';
      document.getElementById('ligneDeplacementType').style.color = '';
    }

    // Tarifs
    document.getElementById('resTaux').textContent = devis.tauxHoraireBase + ' $/h';

    var majContainer = document.getElementById('resMajorations');
    majContainer.innerHTML = '';
    devis.majorations.forEach(function (m) {
      majContainer.innerHTML += '<div class="resultat-ligne">' +
        '<span class="label">' + m.label + '</span>' +
        '<span class="value" style="color: var(--demenagement);">+' + m.montant + ' $/h</span></div>';
    });

    if (devis.majorations.length > 0) {
      majContainer.innerHTML += '<div class="resultat-ligne" style="font-weight:600;">' +
        '<span class="label">Taux effectif</span>' +
        '<span class="value">' + devis.tauxEffectif + ' $/h</span></div>';
    }

    // Couts
    document.getElementById('resHeuresTravail').textContent = devis.tempsTravailHeures;
    document.getElementById('resCoutTravail').textContent = fmt(devis.coutTravail);
    document.getElementById('resHeuresDepl').textContent = devis.tempsDeplacementHeures;
    document.getElementById('resCoutDepl').textContent = fmt(devis.coutDeplacement);

    // Total
    document.getElementById('resSousTotal').textContent = fmt(devis.sousTotal);
    document.getElementById('resTPS').textContent = fmt(devis.tps);
    document.getElementById('resTVQ').textContent = fmt(devis.tvq);
    document.getElementById('resTotalFinal').textContent = fmt(devis.total);

    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  // --- SOUMISSION DE LA DEMANDE ---
  document.getElementById('btnSoumettre').addEventListener('click', function () {
    if (!dernierDevis) return;

    var prenom = document.getElementById('clientPrenom').value.trim();
    var nom = document.getElementById('clientNom').value.trim();
    var tel = document.getElementById('clientTel').value.trim();
    var email = document.getElementById('clientEmail').value.trim();
    var notes = document.getElementById('clientNotes').value.trim();
    var valid = true;

    // Validation simple
    if (!prenom) { document.getElementById('clientPrenom').style.borderColor = 'var(--error)'; valid = false; }
    else { document.getElementById('clientPrenom').style.borderColor = ''; }

    if (!nom) { document.getElementById('clientNom').style.borderColor = 'var(--error)'; valid = false; }
    else { document.getElementById('clientNom').style.borderColor = ''; }

    if (!tel) { document.getElementById('clientTel').style.borderColor = 'var(--error)'; valid = false; }
    else { document.getElementById('clientTel').style.borderColor = ''; }

    if (!email) { document.getElementById('clientEmail').style.borderColor = 'var(--error)'; valid = false; }
    else { document.getElementById('clientEmail').style.borderColor = ''; }

    if (!valid) return;

    // Soumettre la reservation
    var clientInfo = {
      prenom: prenom,
      nom: nom,
      telephone: tel,
      email: email,
      notes: notes
    };

    var reservation = DevisEngine.soumettreReservation(dernierDevis, clientInfo);

    // Afficher confirmation
    document.getElementById('soumissionForm').style.display = 'none';
    document.getElementById('soumissionSuccess').classList.add('visible');
    document.getElementById('resNumero').textContent = reservation.id;

    window.scrollTo({ top: 300, behavior: 'smooth' });
  });

});
