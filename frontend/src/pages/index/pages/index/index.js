import './index.css';

import { Link } from 'react-router-dom';

import { LinkArrowRight as LinkArrowRightIcon } from '../../../../svg';

export default function Index() {
    return (
        <div id='home_container'>
            <h1 id='home_title'>
                Buter
            </h1>
            <span id='home_description'>
                <p>
                    Not Ruter. 100% original not stolen website / consept / idea. Ruter is a copy of Buter.
                </p>
                <p>
                    &copy;2026 Buter Corporation.
                </p>
            </span>
            <Link className='fancy_link' to='/journeyplanner'>
                Journey Planner <LinkArrowRightIcon className='fancy_link_icon' />
            </Link>
        </div>
    );
}