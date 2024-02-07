import { Outlet } from 'react-router-dom';

export default function MainWindow() {
    return (
        <div id='main_window'>
            <Outlet />
        </div>
    );
}