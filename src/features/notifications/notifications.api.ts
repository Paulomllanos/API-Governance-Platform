import { httpRequest } from '../../shared/services/http-client';
export interface NotificationItem {id:string;title:string;message:string;createdAt:string;read:boolean;url:string}
export interface NotificationsResponse {unread:number;items:NotificationItem[]}
export const fetchNotifications = () => httpRequest<NotificationsResponse>('/notifications');
export const markNotificationRead = (id:string) => httpRequest<{id:string;read:boolean}>(`/notifications/${encodeURIComponent(id)}/read`,{method:'PATCH'});
