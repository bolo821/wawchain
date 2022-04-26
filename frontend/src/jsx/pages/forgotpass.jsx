import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import { useDispatch } from 'react-redux';

import { forgotPassword } from '../../actions/user';
import { setMessage } from '../../actions/message';

const initFormData = {
    email: '',
}

function ForgotPassword() {
    const dispatch = useDispatch();
    const history = useHistory();
    const [form, setForm] = useState(() => initFormData);

    const handleChange = (e) => {
        let key = e.target.name;
        let value = e.target.value;
        switch(key) {
            case 'email': {
                setForm({
                    ...form,
                    email: value,
                });
                break;
            }
            default: {
                break;
            }
        }
    }

    const isValidEmail = (email) => {
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
    }

    const validateForm = () => {
        return  form.email !== '' &&
                isValidEmail(form.email);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(validateForm()) {
            dispatch(forgotPassword(form, history));
        } else {
            dispatch(setMessage({
                display: true,
                message: 'Please fill in all fields with valid values.',
            }));
        }
    }

    return (
        <>
            <div className="authincation">
                <div className="container h-100">
                    <div className="row justify-content-center h-100 align-items-center">
                        <div className="col-xl-5 col-md-6">
                            <div className="mini-logo text-center my-3">
                                <Link to={"./"}><img src={require("../../images/logo.png")} alt="" /></Link>
                            </div>
                            <div className="auth-form card">
                                <div className="card-header justify-content-center">
                                    <h4 className="card-title">Forgot Password</h4>
                                </div>
                                <div className="card-body">
                                    <form method="post" name="myform" className="signin_validate">
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" className="form-control" placeholder="hello@example.com" name="email"
                                                onChange={handleChange} />
                                        </div>
                                        <div className="text-center mt-4">
                                            <Button className="btn btn-success btn-block" onClick={handleSubmit}>Send Email</Button>
                                        </div>
                                    </form>
                                    <div className="new-account mt-3">
                                        <p>Already have an account? <Link className="text-primary" to="/signin">Sign in</Link></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword;