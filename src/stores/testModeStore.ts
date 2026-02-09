import { create } from 'zustand';

interface TestModeState {
  isTestMode: boolean;
  toggleTestMode: () => void;
}

export const useTestModeStore = create<TestModeState>((set) => ({
  isTestMode: localStorage.getItem('testMode') === 'true',
  toggleTestMode: () =>
    set((state) => {
      const newValue = !state.isTestMode;
      localStorage.setItem('testMode', String(newValue));
      return { isTestMode: newValue };
    }),
}));

// Données de test pré-remplies pour tous les formulaires
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const nextTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const testData = {
  registerEnterprise: {
    email: 'test-entreprise@workerapp.com',
    password: 'demo1234',
    confirmPassword: 'demo1234',
    firstName: 'Pierre',
    lastName: 'Durand',
    phone: '514-555-0100',
    companyName: 'Test Services Inc.',
    siret: '12345678901234',
    address: '100 rue Test',
    city: 'Montréal',
    postalCode: 'H2X 1A1',
  },
  registerWorker: {
    email: 'test-travailleur@workerapp.com',
    password: 'demo1234',
    confirmPassword: 'demo1234',
    firstName: 'Julie',
    lastName: 'Leblanc',
    phone: '514-555-0200',
    companyName: '',
    siret: '',
    address: '200 avenue Test',
    city: 'Montréal',
    postalCode: 'H3A 2B2',
  },
  createMission: {
    title: 'Nettoyage complet - Bureaux centre-ville',
    description:
      'Nettoyage complet des bureaux sur 2 étages, incluant les salles de réunion, les espaces communs et les sanitaires. Produits écologiques fournis.',
    serviceType: 'MENAGE_ENTREPRISE',
    address: '500 boulevard René-Lévesque',
    city: 'Montréal',
    postalCode: 'H2Z 1W7',
    startDate: nextWeek,
    endDate: nextTwoWeeks,
    startTime: '09:00',
    endTime: '17:00',
    hourlyRate: 22,
    requiredWorkers: 2,
    isRecurring: false,
    requiredSkills: [] as string[],
  },
  workerProfile: {
    bio: 'Travailleur expérimenté avec 5 ans dans le domaine du nettoyage. Consciencieux, ponctuel et rigoureux.',
    city: 'Montréal',
    postalCode: 'H2X 3A5',
    hourlyRate: 20,
    isAvailable: true,
    experienceYears: 5,
    skills: 'Nettoyage, Repassage, Vitres, Organisation',
    serviceTypes: ['MENAGE_DOMICILE', 'MENAGE_ENTREPRISE'],
  },
};
