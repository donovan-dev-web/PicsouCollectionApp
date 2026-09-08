import { useCallback, useImperativeHandle, useState } from 'react';
import type { Ref } from 'react';
import { consumePendingBarcode } from '@/lib/pending-barcode';
import type { CreateMagazineInput, Magazine } from '@/types';

export type FormValues = {
  publication: string;
  issueNumber: string;
  edition: string;
  language: string;
  condition: string;
  month: string | null;
  year: string | null;
  barcode: string;
  notes: string;
};

export type MagazineFormHandle = {
  submit: () => Promise<void>;
};

/** Convertit (mois, année) en date ISO « YYYY-MM » ou null si incomplète. */
export function publicationDateFrom(month: string | null, year: string | null): string | null {
  if (!month || !year) {
    return null;
  }
  return `${year}-${month}`;
}

type BuildInputOptions = {
  initial?: Magazine;
  initialBarcode?: string;
  initialPublication?: string;
  initialIssueNumber?: number | null;
  initialYear?: string | null;
};

export function initialFormValues(options: BuildInputOptions): FormValues {
  const { initial, initialBarcode, initialPublication, initialIssueNumber, initialYear } = options;
  const date = initial?.publicationDate ?? '';
  const [year, month] = date.length === 7 ? date.split('-') : ['', ''];
  const prefilledYear = initialYear ?? (year || null);
  return {
    publication: initialPublication ?? initial?.publication ?? '',
    issueNumber:
      initialIssueNumber != null
        ? String(initialIssueNumber)
        : initial?.issueNumber != null
          ? String(initial.issueNumber)
          : '',
    edition: initial?.edition ?? '',
    language: initial?.language ?? '',
    condition: initial?.condition ?? '',
    month: month || null,
    year: prefilledYear || null,
    barcode: initial?.barcode ?? initialBarcode ?? '',
    notes: initial?.notes ?? '',
  };
}

/** Construit l'entrée métier à partir des valeurs brutes du formulaire. */
export function buildMagazineInput(values: FormValues): CreateMagazineInput {
  const issueDigits = values.issueNumber.trim();
  return {
    publication: values.publication.trim(),
    issueNumber: issueDigits ? Number(issueDigits) : null,
    edition: values.edition.trim() || null,
    language: values.language.trim() || null,
    condition: values.condition.trim() || null,
    publicationDate: publicationDateFrom(values.month, values.year),
    barcode: values.barcode.trim() || null,
    notes: values.notes.trim() || null,
  };
}

type Params = {
  initial?: Magazine;
  initialBarcode?: string;
  initialPublication?: string;
  initialIssueNumber?: number | null;
  initialYear?: string | null;
  onSubmit: (input: CreateMagazineInput) => Promise<void> | void;
  ref?: Ref<MagazineFormHandle>;
};

export function useMagazineForm({
  initial,
  initialBarcode,
  initialPublication,
  initialIssueNumber,
  initialYear,
  onSubmit,
  ref,
}: Params) {
  const [values, setValues] = useState<FormValues>(() =>
    initialFormValues({
      initial,
      initialBarcode,
      initialPublication,
      initialIssueNumber,
      initialYear,
    }),
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof FormValues, value: string | null) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const consumeBarcode = useCallback(() => {
    const pending = consumePendingBarcode();
    if (pending) {
      setValues((prev) => ({ ...prev, barcode: pending }));
    }
  }, []);

  const canSubmit = values.publication.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    const issueDigits = values.issueNumber.trim();
    if (issueDigits && !/^\d+$/.test(issueDigits)) {
      setFormError('Le numéro doit être composé uniquement de chiffres.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(buildMagazineInput(values));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, onSubmit, values]);

  useImperativeHandle(ref, () => ({ submit: () => handleSubmit() }), [handleSubmit]);

  return { values, set, submitting, formError, canSubmit, handleSubmit, consumeBarcode };
}
