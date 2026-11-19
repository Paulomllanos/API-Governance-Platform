import { Outlet } from 'react-router-dom'

import { Sidebar } from '../Sidebar/Sidebar'
import { Topbar } from '../Topbar/Topbar'

import './AppLayout.css'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-layout-main">
        <Topbar />

        <main className="app-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}