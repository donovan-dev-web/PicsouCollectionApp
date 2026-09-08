import {
  buildMagazineInput,
  initialFormValues,
  publicationDateFrom,
  type FormValues,
} from '@/components/use-magazine-form';

describe('publicationDateFrom', () => {
  it('renvoie la date ISO YYYY-MM quand mois et année sont fournis', () => {
    expect(publicationDateFrom('03', '2023')).toBe('2023-03');
  });

  it('renvoie null si le mois ou l’année manquent', () => {
    expect(publicationDateFrom(null, '2023')).toBeNull();
    expect(publicationDateFrom('03', null)).toBeNull();
    expect(publicationDateFrom(null, null)).toBeNull();
  });
});

describe('buildMagazineInput', () => {
  it('convertit les valeurs brutes en entrée métier avec trim', () => {
    const values: FormValues = {
      publication: ' Picsou ',
      issueNumber: '547',
      edition: ' standard ',
      language: ' FR ',
      condition: '',
      month: '03',
      year: '2023',
      barcode: '',
      notes: ' n° spécial ',
    };
    expect(buildMagazineInput(values)).toEqual({
      publication: 'Picsou',
      issueNumber: 547,
      edition: 'standard',
      language: 'FR',
      condition: null,
      publicationDate: '2023-03',
      barcode: null,
      notes: 'n° spécial',
    });
  });

  it('convertit les champs vides en null', () => {
    const values: FormValues = {
      publication: 'Mickey',
      issueNumber: '',
      edition: '',
      language: '',
      condition: '  ',
      month: null,
      year: null,
      barcode: '  ',
      notes: '',
    };
    expect(buildMagazineInput(values)).toEqual({
      publication: 'Mickey',
      issueNumber: null,
      edition: null,
      language: null,
      condition: null,
      publicationDate: null,
      barcode: null,
      notes: null,
    });
  });
});

describe('initialFormValues', () => {
  it('préremplit depuis une fiche édition existante', () => {
    const values = initialFormValues({
      initial: {
        id: 'm1',
        publication: 'Picsou',
        issueNumber: 547,
        edition: 'standard',
        language: 'FR',
        condition: null,
        publicationDate: '2023-03',
        barcode: '3271234567890',
        notes: 'nc',
        ocrText: null,
        createdAt: '',
        updatedAt: '',
      },
    });
    expect(values.publication).toBe('Picsou');
    expect(values.issueNumber).toBe('547');
    expect(values.month).toBe('03');
    expect(values.year).toBe('2023');
    expect(values.barcode).toBe('3271234567890');
  });

  it('applique les valeurs initiales explicites en priorité', () => {
    const values = initialFormValues({
      initialBarcode: '5901234123457',
      initialPublication: 'Vacances',
      initialIssueNumber: 12,
      initialYear: '2020',
    });
    expect(values.publication).toBe('Vacances');
    expect(values.issueNumber).toBe('12');
    expect(values.year).toBe('2020');
  });
});
