import { StreamPackage } from './StreamPackage';
export declare function findStreamPackages(rootDir?: string): Record<string, StreamPackage>;
export declare function findFileUp(filename: string, cwd: string, limit?: number): string;
