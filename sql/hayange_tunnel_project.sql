
-- Complete SQL script for creating the Hayange tunnel lighting renovation project

DO $$
DECLARE 
    marche_id UUID;
    fascicule_desc_id UUID;
    fascicule_consist_id UUID;
    fascicule_install_id UUID;
    fascicule_specs_id UUID;
    fascicule_exec_id UUID;
    fascicule_sec_id UUID;
    fascicule_essais_id UUID;
    fascicule_auto_id UUID;
    fascicule_doc_id UUID;
    fascicule_suivi_id UUID;
    current_date TIMESTAMPTZ := NOW();
    doc_id UUID;
    creator_name VARCHAR := 'Système';  -- Default creator name
BEGIN
    -- Create the marché record first - using the specific Hayange tunnel project details
    INSERT INTO marches (
        id, 
        titre, 
        statut, 
        description, 
        client, 
        datecreation, 
        budget, 
        type_marche, 
        date_debut, 
        date_fin, 
        date_notification,
        periode_preparation,
        periode_chantier,
        ville,
        code_postal,
        pays,
        region,
        adresse,
        commentaire
    ) 
    VALUES (
        gen_random_uuid(),
        'Marché de rénovation du système d''éclairage du tunnel du Bois des Chênes à Hayange',
        'En cours',
        'Rénovation complète du système d''éclairage du tunnel du Bois des Chênes - CCTP (Cahier des Clauses Techniques Particulières)',
        'Ville de Hayange',
        current_date,
        '550 000 €',
        'Travaux',
        current_date,
        current_date + interval '9 months',
        current_date - interval '1 month',
        '1 mois',
        '8 mois',
        'Hayange',
        '57700',
        'France',
        'Grand Est',
        'Tunnel du Bois des Chênes, 57700 Hayange',
        'Marché de performance visant à moderniser l''éclairage du tunnel et à réduire la consommation énergétique de 65%'
    ) RETURNING id INTO marche_id;
    
    RAISE NOTICE 'Created marché with ID: %', marche_id;

    -- Insert fascicule 1: Description générale du projet
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Description générale du projet',
        'Note descriptive synthétique, Plan de situation géographique, Classification technique ouvrage, Cadre réglementaire applicable, Caractéristiques générales de l''ouvrage',
        marche_id,
        5, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_desc_id;

    -- Insert fascicule 2: Consistance et préparation des travaux
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Consistance et préparation des travaux',
        'PPSPS (Plan sécurité/protection santé), Valorisation/dépose équipements existants, Fiche de piquetage et test des équipements, Protocole nettoyage environnemental',
        marche_id,
        4, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_consist_id;

    -- Insert fascicule 3: Installations projetées
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Installations projetées',
        'Schéma installation éclairage (base, renforcement, sécurité), Plans détaillés positionnement luminaires et câbles, Étude photométrique complète (niveaux luminance et éclairement), Justification dimensionnement technique éclairage',
        marche_id,
        4, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_install_id;

    -- Insert fascicule 4: Spécifications techniques matériel
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Spécifications techniques matériel',
        'Fiches techniques luminaires LED, Spécifications automatismes (Automate industriel API), Caractéristiques câbles basse tension et dérivation, Protection anti-corrosion (galvanisation, peinture)',
        marche_id,
        4, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_specs_id;

    -- Insert fascicule 5: Exécution des prestations
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Exécution des prestations',
        'Planning détaillé réalisation travaux, Plan de calepinage implantation matériel, Carnet de câbles et repérage exhaustif, Note sélectivité électrique approuvée',
        marche_id,
        4, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_exec_id;

    -- Insert fascicule 6: Sécurité des interventions
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Sécurité des interventions',
        'Note procédures générales sécurité interventions, Modalités précises accès et stationnement, Instructions spécifiques interventions de nuit',
        marche_id,
        3, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_sec_id;

    -- Insert fascicule 7: Essais, réception, maintenance
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Essais, réception, maintenance',
        'Protocoles d''essais usine/site (EAP, EAS, EAG), Inventaire détaillé lot maintenance fourni, Dossier DOE final complet',
        marche_id,
        3, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_essais_id;

    -- Insert fascicule 8: Automatisme et supervision GTC
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Automatisme et supervision GTC',
        'Analyse fonctionnelle détaillée automatisme et supervision, Guide utilisateur des IHM opérateur et administrateur, Note paramétrage supervision (alarme, gradation éclairage)',
        marche_id,
        3, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_auto_id;

    -- Insert fascicule 9: Documentation et formation
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Documentation et formation',
        'Manuel d''utilisation général, Programme et support pédagogique formation personnel, Fiches méthodes de maintenance',
        marche_id,
        3, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_doc_id;

    -- Insert fascicule 10: Suivi maintenance et supervision
    INSERT INTO fascicules (id, nom, description, marche_id, nombredocuments, progression, datemaj)
    VALUES (
        gen_random_uuid(),
        'Suivi maintenance et supervision',
        'Protocole historique données performances luminaires, Cahier de maintenance périodique, Checklist supervision et maintenance régulière',
        marche_id,
        3, 0, current_date::TEXT
    ) RETURNING id INTO fascicule_suivi_id;

    -- Insert documents for all fascicules with Hayange tunnel-specific information
    -- Start with Description générale du projet documents
    INSERT INTO documents (id, nom, type, statut, version, description, marche_id, fascicule_id, designation, domaine_technique, dateupload, geographie, phase, emetteur, numero_operation)
    VALUES 
      (gen_random_uuid(), 'Note descriptive synthétique', 'Note technique', 'À créer', '1.0', 'Description générale du projet de rénovation de l''éclairage du tunnel', marche_id, fascicule_desc_id, 'Note descriptive synthétique', 'Éclairage tunnel', current_date::TEXT, 'Tunnel du Bois des Chênes', 'Conception', 'Bureau d''études', 'TUNNEL-2025-001')
    RETURNING id INTO doc_id;
    
    -- Create version A for this document
    INSERT INTO versions (id, document_id, marche_id, version, cree_par, date_creation, statut)
    VALUES (gen_random_uuid(), doc_id, marche_id, 'A', creator_name, current_date, 'À valider');

    INSERT INTO documents (id, nom, type, statut, version, description, marche_id, fascicule_id, designation, domaine_technique, dateupload, geographie, phase, emetteur, numero_operation)
    VALUES 
      (gen_random_uuid(), 'Plan de situation géographique', 'Plan', 'À créer', '1.0', 'Plan de situation du tunnel dans son environnement', marche_id, fascicule_desc_id, 'Plan situation', 'Géographie', current_date::TEXT, 'Tunnel du Bois des Chênes', 'Conception', 'Géomètre', 'TUNNEL-2025-002')
    RETURNING id INTO doc_id;
    
    -- Create version A for this document
    INSERT INTO versions (id, document_id, marche_id, version, cree_par, date_creation, statut)
    VALUES (gen_random_uuid(), doc_id, marche_id, 'A', creator_name, current_date, 'À valider');

    -- Add specific tunnel-related documents
    INSERT INTO documents (id, nom, type, statut, version, description, marche_id, fascicule_id, designation, domaine_technique, dateupload, geographie, phase, emetteur, numero_operation)
    VALUES 
      (gen_random_uuid(), 'Étude de sécurité spécifique tunnel', 'Étude sécurité', 'À créer', '1.0', 'Étude de sécurité spécifique aux interventions en tunnel', marche_id, fascicule_sec_id, 'Sécurité tunnel', 'Sécurité', current_date::TEXT, 'Tunnel du Bois des Chênes', 'Conception', 'Bureau d''études', 'TUNNEL-2025-SEC-001')
    RETURNING id INTO doc_id;
    
    -- Create version A for this document
    INSERT INTO versions (id, document_id, marche_id, version, cree_par, date_creation, statut)
    VALUES (gen_random_uuid(), doc_id, marche_id, 'A', creator_name, current_date, 'À valider');
    
    -- Update the document count for each fascicule - fix for ambiguous column name
    UPDATE fascicules f 
    SET nombredocuments = (
        SELECT COUNT(*) 
        FROM documents d 
        WHERE d.fascicule_id = f.id
    )
    WHERE f.marche_id = marche_id;
    
    -- Output generated marche_id for reference
    RAISE NOTICE 'Generated marche_id: %', marche_id;
    
END $$;
