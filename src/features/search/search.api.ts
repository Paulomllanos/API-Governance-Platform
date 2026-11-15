import { httpRequest } from '../../shared/services/http-client';
export interface SearchHit {id:string;title:string;description:string;url:string}
export interface SearchResponse {apis:SearchHit[];evaluations:SearchHit[];findings:SearchHit[]}
export const searchAll = (query:string) => httpRequest<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
