import React from 'react';
import Button from 'react-bootstrap/Button';

import { useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

import { verifyEmail } from '../../actions/user';


function Verify() {
    const dispatch = useDispatch();
    const history = useHistory();
    const { userId } = useParams();

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(verifyEmail({userId}, history));
    }

    return (
        <div className="d-flex">
            <Button className="btn btn-success m-auto" onClick={handleSubmit}>Confirm</Button>
        </div>
    )
}

export default Verify;