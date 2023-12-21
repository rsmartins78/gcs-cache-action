/* eslint-disable sonarjs/no-duplicate-string */

import * as exec from '@actions/exec';
import * as semver from 'semver';

export enum CompressionMethod {
  GZIP = 'gzip',
  ZSTD = 'zstd',
}

async function getTarCompressionMethod(): Promise<CompressionMethod> {
  if (process.platform === 'win32') {
    return CompressionMethod.GZIP;
  }
  return CompressionMethod.ZSTD;
}

export async function createTar(
  archivePath: string,
  paths: string[],
  cwd: string,
): Promise<CompressionMethod> {
  const compressionMethod = await getTarCompressionMethod();
  console.log(`🔹 Using '${compressionMethod}' compression method.`);

  const compressionArgs =
    compressionMethod === CompressionMethod.GZIP
      ? ['-z']
      : ['--use-compress-program', 'zstd -T0 --long=30 --fast=1'];

  await exec.exec('tar', [
    '-c',
    ...compressionArgs,
    '--posix',
    '-P',
    '-f',
    archivePath,
    '-C',
    cwd,
    ...paths,
  ]);

  return compressionMethod;
}

export async function extractTar(
  archivePath: string,
  compressionMethod: CompressionMethod,
  cwd: string,
): Promise<void> {
  console.log(
    `🔹 Detected '${compressionMethod}' compression method from object metadata.`,
  );

  const compressionArgs =
    compressionMethod === CompressionMethod.GZIP
      ? ['-z']
      : ['--use-compress-program', 'zstd -d -T0 --long=30 --fast=1'];

  await exec.exec('tar', [
    '-x',
    ...compressionArgs,
    '-P',
    '-f',
    archivePath,
    '-C',
    cwd,
  ]);
}
