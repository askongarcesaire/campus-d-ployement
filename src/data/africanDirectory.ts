/**
 * CampusHub Africa — Annuaire Académique & Géographique Complet des 54 Pays d'Afrique
 * Chaque pays intègre ses principales villes universitaires et ses universités de référence.
 */

export interface CountryAcademicData {
  name: string;
  code: string;
  flag: string;
  region: 'Afrique de l’Ouest' | 'Afrique Centrale' | 'Afrique du Nord' | 'Afrique de l’Est' | 'Afrique Australe' | 'International & Diaspora';
  cities: string[];
  universities: string[];
}

export const AFRICAN_ACADEMIC_DIRECTORY: Record<string, CountryAcademicData> = {
  // ==========================================
  // AFRIQUE DE L'OUEST
  // ==========================================
  'Sénégal': {
    name: 'Sénégal',
    code: 'SN',
    flag: '🇸🇳',
    region: 'Afrique de l’Ouest',
    cities: [
      'Dakar', 'Saint-Louis', 'Thiès', 'Ziguinchor', 'Bambey', 'Kaolack',
      'Diamniadio', 'Touba', 'Mbour', 'Fatick', 'Kolda', 'Tambacounda'
    ],
    universities: [
      'Université Cheikh Anta Diop (UCAD) - Dakar',
      'Université Gaston Berger (UGB) - Saint-Louis',
      'Université Iba Der Thiam (UIDT) - Thiès',
      'Université Assane Seck (UASZ) - Ziguinchor',
      'Université Alioune Diop (UADB) - Bambey',
      'Université Sine Saloum El-Hâdj Ibrahima NIASS (USSEIN) - Kaolack',
      'Université Amadou Mahtar Mbow (UAM) - Diamniadio',
      'Université Numérique Cheikh Hamidou Kane (UN-CHK / Ex-UVS)',
      'École Supérieure Polytechnique (ESP) - Dakar',
      'École Polytechnique de Thiès (EPT)',
      'Institut Africain de Management (IAM) - Dakar',
      'BEM Management School - Dakar',
      'Institut Supérieur de Management (ISM) - Dakar',
      'Centre Africain d’Études Supérieures en Gestion (CESAG) - Dakar',
      'École des Hautes Études Commerciales (HEC) - Dakar',
      'Autre université / établissement au Sénégal'
    ]
  },
  'Côte d\'Ivoire': {
    name: 'Côte d\'Ivoire',
    code: 'CI',
    flag: '🇨🇮',
    region: 'Afrique de l’Ouest',
    cities: [
      'Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'Korhogo', 'San-Pédro',
      'Man', 'Bassam', 'Gagnoa', 'Bondoukou', 'Abengourou'
    ],
    universities: [
      'Université Félix Houphouët-Boigny (UFHB) - Abidjan Cocody',
      'Université Nangui Abrogoua (UNA) - Abidjan Abobo-Adjamé',
      'Institut National Polytechnique Félix Houphouët-Boigny (INP-HB) - Yamoussoukro',
      'Université Alassane Ouattara (UAO) - Bouaké',
      'Université Jean Lorougnon Guédé (UJLoG) - Daloa',
      'Université Péléforo Gon Coulibaly (UPGC) - Korhogo',
      'Université de San-Pédro (USP)',
      'Université de Man (U-Man)',
      'Université Virtuelle de Côte d’Ivoire (UVCI) - Abidjan',
      'École Normale Supérieure (ENS) - Abidjan',
      'École Nationale Supérieure de Statistique et d’Économie Appliquée (ENSEA) - Abidjan',
      'Groupe CSI Pôle Polytechnique - Abidjan',
      'Institut Universitaire d’Abidjan (IUA)',
      'Université Internationale de Grand-Bassam (UIGB)',
      'Autre université / établissement en Côte d\'Ivoire'
    ]
  },
  'Bénin': {
    name: 'Bénin',
    code: 'BJ',
    flag: '🇧🇯',
    region: 'Afrique de l’Ouest',
    cities: [
      'Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Abomey',
      'Ouidah', 'Bohicon', 'Kandi', 'Natitingou', 'Djougou', 'Lokossa'
    ],
    universities: [
      'Université d’Abomey-Calavi (UAC) - Cotonou / Calavi',
      'Université de Parakou (UP)',
      'Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques (UNSTIM) - Abomey',
      'Université Nationale d’Agriculture (UNA) - Porto-Novo',
      'École Polytechnique d’Abomey-Calavi (EPAC)',
      'Institut Régional de Santé Publique (IRSP) - Ouidah',
      'École Nationale d’Économie Appliquée et de Management (ENEAM) - Cotonou',
      'Institut de Mathématiques et de Sciences Physiques (IMSP) - Dangbo',
      'Haute École de Commerce et de Management (HECM) - Cotonou',
      'African School of Economics (ASE) - Abomey-Calavi',
      'Autre université / établissement au Bénin'
    ]
  },
  'Burkina Faso': {
    name: 'Burkina Faso',
    code: 'BF',
    flag: '🇧🇫',
    region: 'Afrique de l’Ouest',
    cities: [
      'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Fada N’Gourma',
      'Dédougou', 'Ouahigouya', 'Kaya', 'Banfora'
    ],
    universities: [
      'Université Joseph Ki-Zerbo (UJKZ) - Ouagadougou 1',
      'Université Thomas Sankara (UTS) - Ouagadougou 2',
      'Institut International d’Ingénierie de l’Eau et de l’Environnement (2iE) - Ouagadougou',
      'Université Nazi Boni (UNB) - Bobo-Dioulasso',
      'Université Norbert Zongo (UNZ) - Koudougou',
      'Université de Fada N’Gourma (UFDG)',
      'Université de Dédougou (UDDG)',
      'Université Virtuelle du Burkina Faso (UV-BF)',
      'Institut Supérieur de Technologies (IST) - Ouagadougou',
      'Aube Nouvelle University (U-AUBEN) - Ouagadougou',
      'Autre université / établissement au Burkina Faso'
    ]
  },
  'Mali': {
    name: 'Mali',
    code: 'ML',
    flag: '🇲🇱',
    region: 'Afrique de l’Ouest',
    cities: [
      'Bamako', 'Ségou', 'Sikasso', 'Mopti', 'Koulikoro', 'Kayes', 'Gao', 'Tombouctou'
    ],
    universities: [
      'Université des Sciences, des Techniques et des Technologies de Bamako (USTTB)',
      'Université des Lettres et des Sciences Humaines de Bamako (ULSHB)',
      'Université des Sciences Juridiques et Politiques de Bamako (USJPB)',
      'Université des Sciences Sociales et de Gestion de Bamako (USSGB)',
      'Université de Ségou (US)',
      'École Nationale d’Ingénieurs Abderhamane Baba Touré (ENI-ABT) - Bamako',
      'Institut Polytechnique Rural de Formation et de Recherche Appliquée (IPR/IFRA) - Katibougou',
      'École Normale Supérieure (ENSup) - Bamako',
      'Autre université / établissement au Mali'
    ]
  },
  'Togo': {
    name: 'Togo',
    code: 'TG',
    flag: '🇹🇬',
    region: 'Afrique de l’Ouest',
    cities: [
      'Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Dapaong', 'Tsévié', 'Aného'
    ],
    universities: [
      'Université de Lomé (UL)',
      'Université de Kara (UK)',
      'École Africaine des Métiers de l’Architecture et de l’Urbanisme (EAMAU) - Lomé',
      'École Nationale Supérieure d’Ingénieurs (ENSI) - Lomé',
      'Centre d’Études Doctorales et de Recherches de Lomé',
      'Institut Africain d’Administration et d’Études Commerciales (IAEC) - Lomé',
      'Université Catholique de l’Afrique de l’Ouest (UCAO-UUT) - Lomé',
      'Autre université / établissement au Togo'
    ]
  },
  'Guinée': {
    name: 'Guinée',
    code: 'GN',
    flag: '🇬🇳',
    region: 'Afrique de l’Ouest',
    cities: [
      'Conakry', 'Kankan', 'Labé', 'Kindia', 'Nzérékoré', 'Mamou', 'Boké', 'Faranah'
    ],
    universities: [
      'Université Gamal Abdel Nasser de Conakry (UGANC)',
      'Université Général Lansana Conté de Sonfonia (UGLC) - Conakry',
      'Université Julius Nyerere de Kankan (UJNK)',
      'Université de Labé',
      'Université de Kindia',
      'Institut Supérieur des Mines et de la Géologie de Boké (ISMGB)',
      'Institut Supérieur de Technologie de Mamou (IST-Mamou)',
      'Institut Supérieur Agronomique et Vétérinaire de Faranah (ISAV/V-Faranah)',
      'Université Kofi Annan de Guinée (UKAG) - Conakry',
      'Autre université / établissement en Guinée'
    ]
  },
  'Niger': {
    name: 'Niger',
    code: 'NE',
    flag: '🇳🇪',
    region: 'Afrique de l’Ouest',
    cities: [
      'Niamey', 'Maradi', 'Zinder', 'Tahoua', 'Agadez', 'Dosso', 'Diffa', 'Tillabéri'
    ],
    universities: [
      'Université Abdou Moumouni (UAM) - Niamey',
      'Université Dan Dicko Dankoulodo de Maradi (UDDM)',
      'Université André Salifou de Zinder (UASZ)',
      'Université de Tahoua (UT)',
      'Université d’Agadez (UAZ)',
      'Université Islamique de Say',
      'École des Mines, de l’Industrie et de la Géologie (EMIG) - Niamey',
      'Institut Africain de Technologie (IAT) - Niamey',
      'Autre université / établissement au Niger'
    ]
  },
  'Nigeria': {
    name: 'Nigeria',
    code: 'NG',
    flag: '🇳🇬',
    region: 'Afrique de l’Ouest',
    cities: [
      'Lagos', 'Abuja', 'Ibadan', 'Nsukka', 'Zaria', 'Kano', 'Port Harcourt',
      'Benin City', 'Enugu', 'Ilorin', 'Ile-Ife', 'Calabar', 'Owerri'
    ],
    universities: [
      'University of Ibadan (UI)',
      'University of Lagos (UNILAG)',
      'Ahmadu Bello University (ABU) - Zaria',
      'Obafemi Awolowo University (OAU) - Ile-Ife',
      'University of Nigeria, Nsukka (UNN)',
      'University of Ilorin (UNILORIN)',
      'Covenant University - Ota',
      'University of Port Harcourt (UNIPORT)',
      'Federal University of Technology, Akure (FUTA)',
      'Bayero University Kano (BUK)',
      'Autre université / établissement au Nigeria'
    ]
  },
  'Ghana': {
    name: 'Ghana',
    code: 'GH',
    flag: '🇬🇭',
    region: 'Afrique de l’Ouest',
    cities: [
      'Accra', 'Kumasi', 'Cape Coast', 'Tamale', 'Sunyani', 'Koforidua', 'Ho', 'Takoradi'
    ],
    universities: [
      'University of Ghana (UG) - Legon / Accra',
      'Kwame Nkrumah University of Science and Technology (KNUST) - Kumasi',
      'University of Cape Coast (UCC)',
      'Ashesi University - Berekuso',
      'University of Professional Studies, Accra (UPSA)',
      'Ghana Institute of Management and Public Administration (GIMPA)',
      'University of Energy and Natural Resources (UENR) - Sunyani',
      'Autre université / établissement au Ghana'
    ]
  },
  'Mauritanie': {
    name: 'Mauritanie',
    code: 'MR',
    flag: '🇲🇷',
    region: 'Afrique de l’Ouest',
    cities: [
      'Nouakchott', 'Nouadhibou', 'Rosso', 'Kiffa', 'Atar', 'Kaédi', 'Zouérate'
    ],
    universities: [
      'Université de Nouakchott Al Aasriya (UNA)',
      'École Polytechnique de Nouakchott (ESP)',
      'Institut Supérieur des Sciences de la Mer et de la Pêche (ISMP) - Nouadhibou',
      'Institut Supérieur d’Enseignement Technologique (ISET) - Rosso',
      'École Supérieure Polytechnique (ESP) de Mauritanie',
      'Autre université / établissement en Mauritanie'
    ]
  },
  'Cap-Vert': {
    name: 'Cap-Vert',
    code: 'CV',
    flag: '🇨🇻',
    region: 'Afrique de l’Ouest',
    cities: ['Praia', 'Mindelo', 'Espargos', 'Assomada', 'São Filipe'],
    universities: [
      'Universidade de Cabo Verde (Uni-CV) - Praia',
      'Universidade Jean Piaget de Cabo Verde - Praia',
      'Universidade do Mindelo - São Vicente',
      'Autre université / établissement au Cap-Vert'
    ]
  },
  'Gambie': {
    name: 'Gambie',
    code: 'GM',
    flag: '🇬🇲',
    region: 'Afrique de l’Ouest',
    cities: ['Banjul', 'Serekunda', 'Brikama', 'Bakau', 'Farafenni'],
    universities: [
      'University of The Gambia (UTG) - Banjul / Faraba Banta',
      'American International University West Africa (AIUWA)',
      'Management Development Institute (MDI)',
      'Gambia College - Brikama',
      'Autre université / établissement en Gambie'
    ]
  },
  'Guinée-Bissau': {
    name: 'Guinée-Bissau',
    code: 'GW',
    flag: '🇬🇼',
    region: 'Afrique de l’Ouest',
    cities: ['Bissau', 'Bafatá', 'Gabú', 'Canchungo', 'Cacheu'],
    universities: [
      'Universidade Amílcar Cabral (UAC) - Bissau',
      'Universidade Colinas de Boé - Bissau',
      'Faculdade de Medicina Raul Diaz Arguelles - Bissau',
      'Autre université / établissement en Guinée-Bissau'
    ]
  },
  'Liberia': {
    name: 'Liberia',
    code: 'LR',
    flag: '🇱🇷',
    region: 'Afrique de l’Ouest',
    cities: ['Monrovia', 'Gbarnga', 'Buchanan', 'Kakata', 'Harper'],
    universities: [
      'University of Liberia (UL) - Monrovia',
      'Cuttington University - Suakoko / Gbarnga',
      'Stella Maris Polytechnic University - Monrovia',
      'Tubman University - Harper',
      'Autre université / établissement au Liberia'
    ]
  },
  'Sierra Leone': {
    name: 'Sierra Leone',
    code: 'SL',
    flag: '🇸🇱',
    region: 'Afrique de l’Ouest',
    cities: ['Freetown', 'Bo', 'Kenema', 'Makeni', 'Koidu'],
    universities: [
      'University of Sierra Leone (Fourah Bay College) - Freetown',
      'Njala University - Bo / Njala',
      'University of Makeni (UNIMAK)',
      'Institute of Public Administration and Management (IPAM)',
      'Autre université / établissement en Sierra Leone'
    ]
  },

  // ==========================================
  // AFRIQUE CENTRALE
  // ==========================================
  'Cameroun': {
    name: 'Cameroun',
    code: 'CM',
    flag: '🇨🇲',
    region: 'Afrique Centrale',
    cities: [
      'Yaoundé', 'Douala', 'Dschang', 'Buea', 'Ngaoundéré', 'Maroua',
      'Bamenda', 'Bertoua', 'Ebolowa', 'Garoua', 'Kribi'
    ],
    universities: [
      'Université de Yaoundé 1 (UY1) - Ngoa-Ekélé',
      'Université de Yaoundé 2 (UY2) - Soa',
      'Université de Douala (UDla)',
      'Université de Dschang (UDs)',
      'University of Buea (UB)',
      'Université de Ngaoundéré (UN)',
      'Université de Maroua (UMa)',
      'University of Bamenda (UBa)',
      'Université de Bertoua',
      'Université d’Ebolowa',
      'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)',
      'Institut Saint Jean (ISJ) - Yaoundé',
      'Institut Universitaire de la Côte (IUC) - Douala',
      'Université Catholique d’Afrique Centrale (UCAC) - Yaoundé',
      'Autre université / établissement au Cameroun'
    ]
  },
  'RD Congo': {
    name: 'RD Congo',
    code: 'CD',
    flag: '🇨🇩',
    region: 'Afrique Centrale',
    cities: [
      'Kinshasa', 'Lubumbashi', 'Goma', 'Kisangani', 'Bukavu',
      'Mbuji-Mayi', 'Kananga', 'Matadi', 'Kikwit', 'Kolwezi', 'Kindu'
    ],
    universities: [
      'Université de Kinshasa (UNIKIN)',
      'Université de Lubumbashi (UNILU)',
      'Université de Kisangani (UNIKIS)',
      'Université Catholique du Congo (UCC) - Kinshasa',
      'Université Protestante au Congo (UPC) - Kinshasa',
      'Université Pédagogique Nationale (UPN) - Kinshasa',
      'Institut Supérieur des Techniques Appliquées (ISTA) - Kinshasa',
      'Université Libre des Pays des Grands Lacs (ULPGL) - Goma',
      'Université Officielle de Bukavu (UOB)',
      'Université Catholique de Bukavu (UCB)',
      'Université de Goma (UNIGOM)',
      'Autre université / établissement en RD Congo'
    ]
  },
  'Congo': {
    name: 'Congo',
    code: 'CG',
    flag: '🇨🇬',
    region: 'Afrique Centrale',
    cities: [
      'Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Kinkala'
    ],
    universities: [
      'Université Marien Ngouabi (UMNG) - Brazzaville',
      'Université Denis Sassou Nguesso (UDSN) - Kintélé',
      'École Nationale Supérieure Polytechnique (ENSP) - Brazzaville',
      'École Normale Supérieure (ENS) - Brazzaville',
      'Institut Supérieur de Gestion (ISG) - Brazzaville',
      'École Supérieure de Technologie du Littoral - Pointe-Noire',
      'Autre université / établissement au Congo-Brazzaville'
    ]
  },
  'Gabon': {
    name: 'Gabon',
    code: 'GA',
    flag: '🇬🇦',
    region: 'Afrique Centrale',
    cities: [
      'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné'
    ],
    universities: [
      'Université Omar Bongo (UOB) - Libreville',
      'Université des Sciences et Techniques de Masuku (USTM) - Franceville',
      'Université des Sciences de la Santé (USS) - Owendo / Libreville',
      'École Polytechnique de Masuku (EPM) - Franceville',
      'Institut National des Sciences de Gestion (INSG) - Libreville',
      'Institut Supérieur de Technologie (IST) - Libreville',
      'École Nationale des Eaux et Forêts (ENEF) - Libreville',
      'Autre université / établissement au Gabon'
    ]
  },
  'Tchad': {
    name: 'Tchad',
    code: 'TD',
    flag: '🇹🇩',
    region: 'Afrique Centrale',
    cities: [
      'N’Djaména', 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Mongo', 'Ati', 'Pala'
    ],
    universities: [
      'Université de N’Djaména (UNDJ)',
      'Université Adam Barka d’Abéché (UNABA)',
      'Université de Moundou (UDM)',
      'Université de Sarh',
      'École Nationale Supérieure des Technologies de l’Information (ENASTIC) - N’Djaména',
      'Institut Universitaire des Sciences et Techniques d’Abéché (IUSTA)',
      'Université Polytechnique de Mongo',
      'Autre université / établissement au Tchad'
    ]
  },
  'Centrafrique': {
    name: 'Centrafrique',
    code: 'CF',
    flag: '🇨🇫',
    region: 'Afrique Centrale',
    cities: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari', 'Bouar'],
    universities: [
      'Université de Bangui',
      'École Normale Supérieure (ENS) de Bangui',
      'Institut Supérieur de Développement Rural (ISDR) - Mbaïki',
      'Institut Supérieur de Technologie de Bangui',
      'Autre université / établissement en Centrafrique'
    ]
  },
  'Guinée équatoriale': {
    name: 'Guinée équatoriale',
    code: 'GQ',
    flag: '🇬🇶',
    region: 'Afrique Centrale',
    cities: ['Malabo', 'Bata', 'Oyala', 'Ebebiyín', 'Mongomo'],
    universities: [
      'Universidad Nacional de Guinea Ecuatorial (UNGE) - Malabo / Bata',
      'Universidad Afro-Americana del África Central (AAUCA) - Oyala',
      'Autre université / établissement en Guinée équatoriale'
    ]
  },
  'São Tomé-et-Principe': {
    name: 'São Tomé-et-Principe',
    code: 'ST',
    flag: '🇸🇹',
    region: 'Afrique Centrale',
    cities: ['São Tomé', 'Santo António', 'Trindade', 'Neves', 'Santana'],
    universities: [
      'Universidade de São Tomé e Príncipe (USTP)',
      'Instituto Superior Politécnico de São Tomé e Príncipe',
      'Universidade Lusíada de São Tomé e Príncipe',
      'Autre université / établissement à São Tomé-et-Principe'
    ]
  },

  // ==========================================
  // AFRIQUE DU NORD
  // ==========================================
  'Maroc': {
    name: 'Maroc',
    code: 'MA',
    flag: '🇲🇦',
    region: 'Afrique du Nord',
    cities: [
      'Rabat', 'Casablanca', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
      'Oujda', 'Meknès', 'Kénitra', 'Tétouan', 'Benguerir', 'El Jadida'
    ],
    universities: [
      'Université Mohammed V (UM5) - Rabat',
      'Université Hassan II (UH2) - Casablanca',
      'Université Cadi Ayyad (UCA) - Marrakech',
      'Université Sidi Mohamed Ben Abdellah (USMBA) - Fès',
      'Université Abdelmalek Essaâdi (UAE) - Tétouan / Tanger',
      'Université Mohammed VI Polytechnique (UM6P) - Benguerir / Rabat',
      'Université Al Akhawayn (AUI) - Ifrane',
      'Université Ibn Zohr (UIZ) - Agadir',
      'École Mohammadia d’Ingénieurs (EMI) - Rabat',
      'Institut National des Postes et Télécommunications (INPT) - Rabat',
      'École Nationale Supérieure d’Électricité et de Mécanique (ENSEM) - Casablanca',
      'Autre université / établissement au Maroc'
    ]
  },
  'Tunisie': {
    name: 'Tunisie',
    code: 'TN',
    flag: '🇹🇳',
    region: 'Afrique du Nord',
    cities: [
      'Tunis', 'Sfax', 'Sousse', 'Monastir', 'Kairouan', 'Bizerte',
      'Gabès', 'Nabeul', 'Ariana', 'La Manouba', 'Gafsa'
    ],
    universities: [
      'Université de Tunis El Manar (UTM)',
      'Université de Tunis',
      'Université de Carthage - Tunis',
      'Université de la Manouba (UMA)',
      'Université de Sfax (US)',
      'Université de Sousse (USo)',
      'Université de Monastir (UM)',
      'École Nationale d’Ingénieurs de Tunis (ENIT)',
      'Institut National des Sciences Appliquées et de Technologie (INSAT) - Tunis',
      'École Polytechnique de Tunisie (EPT) - La Marsa',
      'Autre université / établissement en Tunisie'
    ]
  },
  'Algérie': {
    name: 'Algérie',
    code: 'DZ',
    flag: '🇩🇿',
    region: 'Afrique du Nord',
    cities: [
      'Alger', 'Oran', 'Constantine', 'Annaba', 'Sétif', 'Tlemcen',
      'Batna', 'Blida', 'Béjaïa', 'Mostaganem', 'Sidi Bel Abbès', 'Ouargla'
    ],
    universities: [
      'Université des Sciences et de la Technologie Houari Boumediene (USTHB) - Alger',
      'Université d’Alger 1 (Benyoucef Benkhedda)',
      'Université d’Oran 1 (Ahmed Ben Bella)',
      'Université des Frères Mentouri - Constantine 1',
      'Université Badji Mokhtar - Annaba',
      'Université Ferhat Abbas - Sétif 1',
      'Université Abou Bekr Belkaïd - Tlemcen',
      'École Nationale Polytechnique (ENP) - Alger',
      'École Supérieure d’Informatique (ESI) - Alger',
      'Autre université / établissement en Algérie'
    ]
  },
  'Égypte': {
    name: 'Égypte',
    code: 'EG',
    flag: '🇪🇬',
    region: 'Afrique du Nord',
    cities: [
      'Le Caire', 'Alexandrie', 'Gizeh', 'Mansourah', 'Assiout', 'Zagazig',
      'Tanta', 'Ismaïlia', 'Assouan', 'Port-Saïd'
    ],
    universities: [
      'Cairo University - Le Caire',
      'Ain Shams University - Le Caire',
      'Alexandria University - Alexandrie',
      'Mansoura University',
      'The American University in Cairo (AUC)',
      'Al-Azhar University - Le Caire',
      'Assiut University',
      'Zewail City of Science and Technology',
      'Egypt-Japan University of Science and Technology (E-JUST)',
      'Autre université / établissement en Égypte'
    ]
  },
  'Libye': {
    name: 'Libye',
    code: 'LY',
    flag: '🇱🇾',
    region: 'Afrique du Nord',
    cities: ['Tripoli', 'Benghazi', 'Misrata', 'Zaouïa', 'Sébha', 'Al Bayda'],
    universities: [
      'University of Tripoli',
      'University of Benghazi',
      'Misurata University',
      'Omar Al-Mukhtar University - Bayda',
      'Sebha University',
      'Autre université / établissement en Libye'
    ]
  },
  'Soudan': {
    name: 'Soudan',
    code: 'SD',
    flag: '🇸🇩',
    region: 'Afrique du Nord',
    cities: ['Khartoum', 'Omdourman', 'Port-Soudan', 'Wad Madani', 'El Obeid', 'Kassala'],
    universities: [
      'University of Khartoum',
      'Sudan University of Science and Technology (SUST)',
      'Al-Neelain University - Khartoum',
      'University of Gezira - Wad Madani',
      'Red Sea University - Port-Soudan',
      'Autre université / établissement au Soudan'
    ]
  },

  // ==========================================
  // AFRIQUE DE L'EST
  // ==========================================
  'Rwanda': {
    name: 'Rwanda',
    code: 'RW',
    flag: '🇷🇼',
    region: 'Afrique de l’Est',
    cities: ['Kigali', 'Huye (Butare)', 'Musanze', 'Rubavu', 'Muhanga', 'Rwamagana'],
    universities: [
      'University of Rwanda (UR) - Kigali / Huye',
      'Carnegie Mellon University Africa (CMU-Africa) - Kigali',
      'African Leadership University (ALU) - Kigali',
      'University of Global Health Equity (UGHE) - Butaro',
      'Kigali Independent University (ULK)',
      'Mount Kenya University Rwanda (MKUR)',
      'Adventist University of Central Africa (AUCA)',
      'Autre université / établissement au Rwanda'
    ]
  },
  'Burundi': {
    name: 'Burundi',
    code: 'BI',
    flag: '🇧🇮',
    region: 'Afrique de l’Est',
    cities: ['Bujumbura', 'Gitega', 'Ngozi', 'Rumonge', 'Kayanza', 'Bururi'],
    universities: [
      'Université du Burundi (UB) - Bujumbura',
      'Université de Ngozi (UNG)',
      'Université Lumière de Bujumbura (ULBU)',
      'Université Espoir d’Afrique - Bujumbura',
      'Université des Grands Lacs (UGL) - Bujumbura / Bururi',
      'École Normale Supérieure (ENS) de Bujumbura',
      'Autre université / établissement au Burundi'
    ]
  },
  'Madagascar': {
    name: 'Madagascar',
    code: 'MG',
    flag: '🇲🇬',
    region: 'Afrique de l’Est',
    cities: [
      'Antananarivo', 'Toamasina (Tamatave)', 'Fianarantsoa', 'Mahajanga (Majunga)',
      'Antsiranana (Diégo-Suarez)', 'Toliara (Tuléar)', 'Antsirabe'
    ],
    universities: [
      'Université d’Antananarivo (Ankatso)',
      'Université de Toamasina',
      'Université de Fianarantsoa',
      'Université de Mahajanga',
      'Université d’Antsiranana',
      'Université de Toliara',
      'École Supérieure Polytechnique d’Antananarivo (ESPA)',
      'Institut Supérieur de Technologie d’Antananarivo (IST-T)',
      'Université Catholique de Madagascar (UCM) - Antananarivo',
      'Autre université / établissement à Madagascar'
    ]
  },
  'Kenya': {
    name: 'Kenya',
    code: 'KE',
    flag: '🇰🇪',
    region: 'Afrique de l’Est',
    cities: [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri', 'Kakamega'
    ],
    universities: [
      'University of Nairobi (UoN)',
      'Kenyatta University (KU) - Nairobi',
      'Strathmore University - Nairobi',
      'Jomo Kenyatta University of Agriculture and Technology (JKUAT) - Juja',
      'Moi University - Eldoret',
      'Egerton University - Njoro / Nakuru',
      'United States International University Africa (USIU-Africa) - Nairobi',
      'Mount Kenya University (MKU) - Thika',
      'Autre université / établissement au Kenya'
    ]
  },
  'Éthiopie': {
    name: 'Éthiopie',
    code: 'ET',
    flag: '🇪🇹',
    region: 'Afrique de l’Est',
    cities: [
      'Addis-Abeba', 'Hawassa', 'Bahir Dar', 'Adama', 'Jimma', 'Mekele', 'Gondar', 'Dire Dawa'
    ],
    universities: [
      'Addis Ababa University (AAU)',
      'Jimma University (JU)',
      'Bahir Dar University (BDU)',
      'Hawassa University (HU)',
      'Adama Science and Technology University (ASTU)',
      'University of Gondar (UoG)',
      'Mekelle University (MU)',
      'Arba Minch University',
      'Autre université / établissement en Éthiopie'
    ]
  },
  'Tanzanie': {
    name: 'Tanzanie',
    code: 'TZ',
    flag: '🇹🇿',
    region: 'Afrique de l’Est',
    cities: [
      'Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Morogoro', 'Mbeya', 'Zanzibar'
    ],
    universities: [
      'University of Dar es Salaam (UDSM)',
      'Sokoine University of Agriculture (SUA) - Morogoro',
      'Ardhi University (ARU) - Dar es Salaam',
      'Nelson Mandela African Institution of Science and Technology (NM-AIST) - Arusha',
      'University of Dodoma (UDOM)',
      'State University of Zanzibar (SUZA)',
      'Mzumbe University - Morogoro',
      'Autre université / établissement en Tanzanie'
    ]
  },
  'Ouganda': {
    name: 'Ouganda',
    code: 'UG',
    flag: '🇺🇬',
    region: 'Afrique de l’Est',
    cities: ['Kampala', 'Entebbe', 'Mbarara', 'Gulu', 'Jinja', 'Mbale'],
    universities: [
      'Makerere University (MAK) - Kampala',
      'Mbarara University of Science and Technology (MUST)',
      'Kyambogo University (KYU) - Kampala',
      'Uganda Christian University (UCU) - Mukono',
      'Gulu University',
      'Kampala International University (KIU)',
      'Autre université / établissement en Ouganda'
    ]
  },
  'Maurice': {
    name: 'Maurice',
    code: 'MU',
    flag: '🇲🇺',
    region: 'Afrique de l’Est',
    cities: ['Port-Louis', 'Réduit', 'Curepipe', 'Vacoas', 'Rose-Hill', 'Ébène'],
    universities: [
      'University of Mauritius (UoM) - Réduit',
      'Université des Mascareignes (UdM) - Rose-Hill',
      'University of Technology, Mauritius (UTM) - La Tour Koenig',
      'African Leadership College (ALC) - Pamplemousses',
      'Curtin Mauritius - Moka',
      'Autre université / établissement à Maurice'
    ]
  },
  'Comores': {
    name: 'Comores',
    code: 'KM',
    flag: '🇰🇲',
    region: 'Afrique de l’Est',
    cities: ['Moroni', 'Mutsamudu', 'Fomboni', 'Iconi', 'Mitsamiouli'],
    universities: [
      'Université des Comores (UDC) - Moroni',
      'École de Médecine et de Santé Publique - Moroni',
      'Institut Universitaire de Technologie des Comores',
      'Autre université / établissement aux Comores'
    ]
  },
  'Djibouti': {
    name: 'Djibouti',
    code: 'DJ',
    flag: '🇩🇯',
    region: 'Afrique de l’Est',
    cities: ['Djibouti-Ville', 'Ali Sabieh', 'Tadjourah', 'Dikhil', 'Obock', 'Arta'],
    universities: [
      'Université de Djibouti (UD)',
      'Faculté d’Ingénieurs de Djibouti',
      'Institut Supérieur des Sciences de la Santé (ISSS)',
      'Autre université / établissement à Djibouti'
    ]
  },
  'Seychelles': {
    name: 'Seychelles',
    code: 'SC',
    flag: '🇸🇨',
    region: 'Afrique de l’Est',
    cities: ['Victoria', 'Anse Royale', 'Beau Vallon', 'Praslin', 'La Digue'],
    universities: [
      'University of Seychelles (UniSey) - Anse Royale',
      'Seychelles Tourism Academy (STA)',
      'Autre université / établissement aux Seychelles'
    ]
  },
  'Érythrée': {
    name: 'Érythrée',
    code: 'ER',
    flag: '🇪🇷',
    region: 'Afrique de l’Est',
    cities: ['Asmara', 'Massaoua', 'Keren', 'Assab', 'Mendefera'],
    universities: [
      'Eritrea Institute of Technology (EIT) - Mai Nefhi',
      'College of Marine Sciences and Technology - Massawa',
      'College of Business and Social Sciences - Adi Keih',
      'Autre université / établissement en Érythrée'
    ]
  },
  'Somalie': {
    name: 'Somalie',
    code: 'SO',
    flag: '🇸🇴',
    region: 'Afrique de l’Est',
    cities: ['Mogadiscio', 'Hargeisa', 'Garowe', 'Bosaso', 'Kismayo', 'Baidoa'],
    universities: [
      'Mogadishu University',
      'Somali National University (SNU) - Mogadiscio',
      'University of Hargeisa',
      'SIMAD University - Mogadiscio',
      'Puntland State University (PSU) - Garowe',
      'Autre université / établissement en Somalie'
    ]
  },
  'Soudan du Sud': {
    name: 'Soudan du Sud',
    code: 'SS',
    flag: '🇸🇸',
    region: 'Afrique de l’Est',
    cities: ['Djouba (Juba)', 'Wau', 'Malakal', 'Yei', 'Rumbek'],
    universities: [
      'University of Juba',
      'Upper Nile University - Malakal / Juba',
      'Bahr El Ghazal University - Wau',
      'Catholic University of South Sudan - Juba',
      'Autre université / établissement au Soudan du Sud'
    ]
  },

  // ==========================================
  // AFRIQUE AUSTRALE
  // ==========================================
  'Afrique du Sud': {
    name: 'Afrique du Sud',
    code: 'ZA',
    flag: '🇿🇦',
    region: 'Afrique Australe',
    cities: [
      'Le Cap (Cape Town)', 'Johannesburg', 'Pretoria', 'Durban',
      'Stellenbosch', 'Port Elizabeth (Gqeberha)', 'Bloemfontein', 'Grahamstown (Makhanda)'
    ],
    universities: [
      'University of Cape Town (UCT)',
      'University of the Witwatersrand (Wits) - Johannesburg',
      'Stellenbosch University (SU)',
      'University of Pretoria (UP)',
      'University of KwaZulu-Natal (UKZN) - Durban',
      'University of Johannesburg (UJ)',
      'Rhodes University - Makhanda',
      'University of the Western Cape (UWC)',
      'University of South Africa (UNISA) - Pretoria',
      'North-West University (NWU)',
      'Autre université / établissement en Afrique du Sud'
    ]
  },
  'Angola': {
    name: 'Angola',
    code: 'AO',
    flag: '🇦🇴',
    region: 'Afrique Australe',
    cities: ['Luanda', 'Huambo', 'Benguela', 'Lubango', 'Cabinda', 'Lobito', 'Malanje'],
    universities: [
      'Universidade Agostinho Neto (UAN) - Luanda',
      'Universidade Católica de Angola (UCAN) - Luanda',
      'Universidade José Eduardo dos Santos - Huambo',
      'Universidade Mandume ya Ndemufayo - Lubango',
      'Universidade Katyavala Bwila - Benguela',
      'Universidade Metodista de Angola - Luanda',
      'Autre université / établissement en Angola'
    ]
  },
  'Mozambique': {
    name: 'Mozambique',
    code: 'MZ',
    flag: '🇲🇿',
    region: 'Afrique Australe',
    cities: ['Maputo', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Pemba', 'Inhambane'],
    universities: [
      'Universidade Eduardo Mondlane (UEM) - Maputo',
      'Universidade Pedagógica de Moçambique (UP) - Maputo',
      'Universidade Católica de Moçambique (UCM) - Beira',
      'Universidade Lúrio (UniLúrio) - Nampula',
      'Universidade Politécnica (A Politécnica) - Maputo',
      'Autre université / établissement au Mozambique'
    ]
  },
  'Zambie': {
    name: 'Zambie',
    code: 'ZM',
    flag: '🇿🇲',
    region: 'Afrique Australe',
    cities: ['Lusaka', 'Kitwe', 'Ndola', 'Livingstone', 'Kabwe', 'Chingola'],
    universities: [
      'University of Zambia (UNZA) - Lusaka',
      'Copperbelt University (CBU) - Kitwe',
      'Mulungushi University (MU) - Kabwe',
      'Kwame Nkrumah University - Kabwe',
      'Cavendish University Zambia - Lusaka',
      'Autre université / établissement en Zambie'
    ]
  },
  'Zimbabwe': {
    name: 'Zimbabwe',
    code: 'ZW',
    flag: '🇿🇼',
    region: 'Afrique Australe',
    cities: ['Harare', 'Bulawayo', 'Gweru', 'Mutare', 'Chinhoyi', 'Masvingo'],
    universities: [
      'University of Zimbabwe (UZ) - Harare',
      'National University of Science and Technology (NUST) - Bulawayo',
      'Midlands State University (MSU) - Gweru',
      'Africa University - Mutare',
      'Chinhoyi University of Technology (CUT)',
      'Great Zimbabwe University (GZU) - Masvingo',
      'Harare Institute of Technology (HIT)',
      'Autre université / établissement au Zimbabwe'
    ]
  },
  'Botswana': {
    name: 'Botswana',
    code: 'BW',
    flag: '🇧🇼',
    region: 'Afrique Australe',
    cities: ['Gaborone', 'Francistown', 'Palapye', 'Maun', 'Molepolole', 'Serowe'],
    universities: [
      'University of Botswana (UB) - Gaborone',
      'Botswana International University of Science and Technology (BIUST) - Palapye',
      'Botho University - Gaborone',
      'Botswana Accountancy College (BAC) - Gaborone',
      'Autre université / établissement au Botswana'
    ]
  },
  'Namibie': {
    name: 'Namibie',
    code: 'NA',
    flag: '🇳🇦',
    region: 'Afrique Australe',
    cities: ['Windhoek', 'Walvis Bay', 'Swakopmund', 'Oshakati', 'Rundu'],
    universities: [
      'University of Namibia (UNAM) - Windhoek',
      'Namibia University of Science and Technology (NUST) - Windhoek',
      'International University of Management (IUM) - Windhoek',
      'Autre université / établissement en Namibie'
    ]
  },
  'Malawi': {
    name: 'Malawi',
    code: 'MW',
    flag: '🇲🇼',
    region: 'Afrique Australe',
    cities: ['Lilongwe', 'Blantyre', 'Zomba', 'Mzuzu', 'Kasungu'],
    universities: [
      'University of Malawi (UNIMA) - Zomba',
      'Malawi University of Science and Technology (MUST) - Thyolo',
      'Lilongwe University of Agriculture and Natural Resources (LUANAR)',
      'Mzuzu University (MZUNI)',
      'Catholic University of Malawi - Montfort',
      'Autre université / établissement au Malawi'
    ]
  },
  'Eswatini': {
    name: 'Eswatini',
    code: 'SZ',
    flag: '🇸🇿',
    region: 'Afrique Australe',
    cities: ['Mbabane', 'Manzini', 'Kwaluseni', 'Lobamba', 'Siteki'],
    universities: [
      'University of Eswatini (UNESWA) - Kwaluseni',
      'Southern Africa Nazarene University (SANU) - Manzini',
      'Limkokwing University of Creative Technology - Mbabane',
      'Autre université / établissement en Eswatini'
    ]
  },
  'Lesotho': {
    name: 'Lesotho',
    code: 'LS',
    flag: '🇱🇸',
    region: 'Afrique Australe',
    cities: ['Maseru', 'Roma', 'Teyateyaneng', 'Mafeteng', 'Hlotse'],
    universities: [
      'National University of Lesotho (NUL) - Roma',
      'Limkokwing University of Creative Technology - Maseru',
      'Lesotho College of Education - Maseru',
      'Autre université / établissement au Lesotho'
    ]
  },

  // ==========================================
  // DIASPORA & INTERNATIONAL
  // ==========================================
  'France': {
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    region: 'International & Diaspora',
    cities: [
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille',
      'Montpellier', 'Strasbourg', 'Nantes', 'Rennes', 'Grenoble', 'Nice'
    ],
    universities: [
      'Sorbonne Université - Paris',
      'Université Paris-Saclay',
      'Université Paris Cité',
      'Sciences Po Paris',
      'Institut Polytechnique de Paris (École Polytechnique)',
      'Université de Bordeaux',
      'Université Claude Bernard Lyon 1',
      'Université de Toulouse',
      'Université de Lille',
      'Aix-Marseille Université',
      'Université de Montpellier',
      'CentraleSupélec',
      'Autre établissement / grande école en France'
    ]
  },
  'Canada': {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    region: 'International & Diaspora',
    cities: ['Montréal', 'Québec', 'Ottawa', 'Toronto', 'Vancouver', 'Sherbrooke', 'Moncton'],
    universities: [
      'Université de Montréal (UdeM)',
      'Université Laval - Québec',
      'Université McGill - Montréal',
      'Université du Québec à Montréal (UQAM)',
      'Polytechnique Montréal',
      'HEC Montréal',
      'Université d’Ottawa',
      'Université de Sherbrooke',
      'University of Toronto',
      'Autre université / établissement au Canada'
    ]
  },
  'Belgique': {
    name: 'Belgique',
    code: 'BE',
    flag: '🇧🇪',
    region: 'International & Diaspora',
    cities: ['Bruxelles', 'Liège', 'Louvain-la-Neuve', 'Mons', 'Namur', 'Gand', 'Anvers'],
    universities: [
      'Université Libre de Bruxelles (ULB)',
      'UCLouvain (Louvain-la-Neuve / Bruxelles)',
      'Université de Liège (ULiège)',
      'Université de Mons (UMONS)',
      'Université de Namur (UNamur)',
      'Solvay Brussels School',
      'Autre université / établissement en Belgique'
    ]
  },
  'Autre pays': {
    name: 'Autre pays',
    code: 'WW',
    flag: '🌍',
    region: 'International & Diaspora',
    cities: ['Autre ville / Non répertoriée'],
    universities: [
      'Autre université / établissement'
    ]
  }
};

/**
 * Returns an array of all country names sorted alphabetically,
 * with standard African countries first.
 */
export function getAllAfricanCountries(): string[] {
  return Object.keys(AFRICAN_ACADEMIC_DIRECTORY);
}

/**
 * Returns the list of cities for a given country.
 * If not found, returns a sensible fallback.
 */
export function getCitiesByCountry(country: string): string[] {
  if (!country) return ['Dakar', 'Abidjan', 'Cotonou', 'Yaoundé', 'Kinshasa', 'Ouagadougou', 'Lomé'];
  const data = AFRICAN_ACADEMIC_DIRECTORY[country];
  if (data && data.cities && data.cities.length > 0) {
    return data.cities;
  }
  return ['Ville principale', 'Autre ville'];
}

/**
 * Returns the list of universities for a given country.
 * If not found, returns fallback universities.
 */
export function getUniversitiesByCountry(country: string): string[] {
  if (!country) {
    return [
      'Université Cheikh Anta Diop (UCAD) - Dakar',
      'Université Félix Houphouët-Boigny (UFHB) - Abidjan',
      'Université de Yaoundé 1 (UY1) - Yaoundé',
      'Université d’Abomey-Calavi (UAC) - Cotonou',
      'Autre établissement d’enseignement supérieur'
    ];
  }
  const data = AFRICAN_ACADEMIC_DIRECTORY[country];
  if (data && data.universities && data.universities.length > 0) {
    return data.universities;
  }
  return ['Autre établissement / Institut'];
}

/**
 * Get country metadata (code, flag, region)
 */
export function getCountryMeta(country: string) {
  return AFRICAN_ACADEMIC_DIRECTORY[country] || {
    name: country,
    code: 'AF',
    flag: '🌍',
    region: 'Afrique',
    cities: ['Ville principale', 'Autre ville'],
    universities: ['Autre université / établissement']
  };
}
