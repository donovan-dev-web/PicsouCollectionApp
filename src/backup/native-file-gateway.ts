import type { BackupFormat } from './backup-types';
import type { FileGateway } from './file-gateway';

const DEFAULT_FILENAME_PREFIX = 'picsou-collection';

function fileExtension(format: BackupFormat): 'json' | 'csv' {
  return format;
}

function mimeTypeFor(format: BackupFormat): string {
  return format === 'json' ? 'application/json' : 'text/csv';
}

function buildFileName(format: BackupFormat): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${DEFAULT_FILENAME_PREFIX}-${date}.${fileExtension(format)}`;
}

/**
 * Passage vers le fichier système + partage natif (iOS/Android).
 * Les imports natifs sont paresseux pour ne pas casser l'environnement de test
 * (jest) ni le lancer sur des plateformes sans ces modules.
 */
export class NativeFileGateway implements FileGateway {
  async writeExport(
    content: string,
    format: BackupFormat,
  ): Promise<{ uri: string; shared: boolean; name: string }> {
    const { File, Paths } = await import('expo-file-system');
    const { isAvailableAsync, shareAsync } = await import('expo-sharing');

    const name = buildFileName(format);
    const file = new File(Paths.document, name);
    file.write(content);

    let shared = false;
    try {
      if (await isAvailableAsync()) {
        await shareAsync(file.uri, {
          mimeType: mimeTypeFor(format),
          dialogTitle: 'Exporter la collection',
        });
        shared = true;
      }
    } catch {
      // Partage indisponible : la sauvegarde écrite reste accessible.
      shared = false;
    }

    return { uri: file.uri, shared, name };
  }

  async pickFile(format: BackupFormat): Promise<{ name: string; content: string } | null> {
    const { getDocumentAsync } = await import('expo-document-picker');
    const { File } = await import('expo-file-system');

    const result = await getDocumentAsync({
      type:
        format === 'json'
          ? 'application/json'
          : ['text/csv', 'text/comma-separated-values', 'text/*', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return { name: asset.name, content: await new File(asset.uri).text() };
  }
}
