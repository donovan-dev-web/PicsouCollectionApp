import { useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { getDeps } from '@/dependencies';
import { BarcodeStabilizer } from '@/identification/barcodeStabilizer';
import type { Magazine } from '@/types';

export type ScanState =
  { status: 'idle' } | { status: 'searching' } | { status: 'invalid'; reason: string };

export type Pending = { kind: 'owned'; magazine: Magazine } | { kind: 'unknown'; barcode: string };

/**
 * Logique du scan de code-barres (stabilisation multi-lectures, identification,
 * mode continu) découplée de la vue pour la rendre testable.
 *
 * Retours test physique : le système d'exemplaires a été supprimé — un magazine
 * en collection est donc toujours possédé, il n'y a plus d'ajout d'exemplaire
 * (état « confirm » devenu « déjà en collection ») ni d'état « success ».
 */
export function useBarcodeScanning() {
  const router = useRouter();
  const params = useLocalSearchParams<{ continuous?: string }>();

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ status: 'idle' });
  const [scanning, setScanning] = useState(true);
  const [continuous, setContinuous] = useState(params.continuous === '1');
  const [torchOn, setTorchOn] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const stabilizer = useRef(new BarcodeStabilizer(3));

  const resume = () => {
    stabilizer.current.reset();
    setPending(null);
    setScanning(true);
    setState({ status: 'idle' });
  };

  const handleSingle = async (stabilized: string) => {
    const { identificationService } = getDeps();
    const result = await identificationService.identifyByBarcode(stabilized);

    if (result.status === 'found') {
      router.replace({
        pathname: '/scan/result',
        params: {
          id: result.magazine.id,
          publication: result.magazine.publication,
          issueNumber:
            result.magazine.issueNumber != null ? String(result.magazine.issueNumber) : '',
          barcode: stabilized,
        },
      });
    } else if (result.status === 'ambiguous') {
      router.replace({ pathname: '/scan/multiple', params: { barcode: stabilized } });
    } else if (result.status === 'unknown') {
      router.replace({ pathname: '/scan/result', params: { barcode: stabilized } });
    } else {
      setState({ status: 'invalid', reason: result.reason });
      setScanning(true);
    }
  };

  const handleContinuous = async (stabilized: string) => {
    const { identificationService } = getDeps();
    const result = await identificationService.identifyByBarcode(stabilized);

    if (result.status === 'found') {
      setPending({ kind: 'owned', magazine: result.magazine });
    } else if (result.status === 'ambiguous') {
      router.replace({ pathname: '/scan/multiple', params: { barcode: stabilized } });
    } else if (result.status === 'unknown') {
      setPending({ kind: 'unknown', barcode: stabilized });
    } else {
      setState({ status: 'invalid', reason: result.reason });
      setScanning(true);
    }
  };

  const handleScan = async ({ data }: { data: string; type: string }) => {
    if (!scanning || state.status === 'searching' || pending) {
      return;
    }
    const stabilized = stabilizer.current.push(data);
    if (stabilized === null) {
      return;
    }
    setScanning(false);
    setState({ status: 'searching' });

    if (continuous) {
      await handleContinuous(stabilized);
    } else {
      await handleSingle(stabilized);
    }
  };

  const reset = () => {
    stabilizer.current.reset();
    setScanning(true);
    setState({ status: 'idle' });
  };

  return {
    permission,
    requestPermission,
    state,
    scanning,
    continuous,
    torchOn,
    pending,
    setContinuous,
    setTorchOn,
    handleScan,
    resume,
    reset,
  };
}
