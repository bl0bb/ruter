import './css/global.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';


import MainWindow from './main_window/index';

import IndexLayout from './pages/index/layout/index';
import Index from './pages/index/pages/index/index';
import JourneyPlanner from './pages/index/pages/journey_planner/index';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<MainWindow />}>
                    <Route path='/' element={<IndexLayout />}>
                        <Route index element={<Index />} />
                        <Route path='journeyplanner' element={<JourneyPlanner />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}