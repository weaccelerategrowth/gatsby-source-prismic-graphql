import { HttpOptions } from 'apollo-link-http-common';
import { Page } from '../interfaces/PluginOptions';
interface IPrismicLinkArgs extends HttpOptions {
    uri: string;
    accessToken?: string;
    customRef?: string;
    credentials?: string;
    useGETForQueries?: boolean;
}
export declare const fieldName = "prismic";
export declare const typeName = "PRISMIC";
export declare let linkResolver: (doc: any) => string;
export declare function flatten<T>(arr: T[][]): T[];
export declare function registerLinkResolver(link: typeof linkResolver): void;
export declare function getPagePreviewPath(page: Page): string;
export declare function getCookies(): Map<string, string>;
export declare function getDocumentIndexFromCursor(cursor: string): string;
export declare function getCursorFromDocumentIndex(index: number): string;
export declare function fetchStripQueryWhitespace(url: string, ...args: any): Promise<Response>;
/**
 * Apollo Link for Prismic
 * @param options Options
 */
export declare function PrismicLink({ uri, accessToken, customRef, ...rest }: IPrismicLinkArgs): import("apollo-link").ApolloLink;
export {};
