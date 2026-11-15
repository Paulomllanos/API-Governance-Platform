/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from './notifications.api';
import { NotificationBell } from './NotificationBell';
vi.mock('./notifications.api',()=>({fetchNotifications:vi.fn(),markNotificationRead:vi.fn()}));
const fetchMock=vi.mocked(fetchNotifications);
const readMock=vi.mocked(markNotificationRead);
afterEach(()=>{cleanup();vi.clearAllMocks()});
describe('Campana de notificaciones',()=>{
  it('UI-NOTIF-01: muestra notificaciones y permite marcarlas como leídas',async()=>{
    fetchMock.mockResolvedValue({unread:1,items:[{id:'transition-01',title:'Demo API · IN_REVIEW',message:'Versión 1.0.0 en revisión',createdAt:'2026-11-15T12:00:00.000Z',read:false,url:'/app/apis/api-001'}]});
    readMock.mockResolvedValue({id:'transition-01',read:true});
    render(<MemoryRouter><NotificationBell/></MemoryRouter>);
    fireEvent.click(screen.getByRole('button',{name:'Notificaciones'}));
    expect(await screen.findByText('Demo API · IN_REVIEW')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Demo API/}));
    expect(readMock).toHaveBeenCalledWith('transition-01');
  });
});
