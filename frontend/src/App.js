import './css/global.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';


import IndexLayout from './pages/index/layout/index';
import Index from './pages/index/pages/index/index';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<IndexLayout />}>
                    <Route index element={<Index />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
