import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';

import { signup } from '../../actions/user';
import { setMessage } from '../../actions/message';

const initFormData = {
    name: '',
    email: '',
    password: '',
}

function Signup() {
    const dispatch = useDispatch();
    const history = useHistory();
    const [form, setForm] = useState(() => initFormData);

    const handleChange = (e) => {
        let key = e.target.name;
        let value = e.target.value;
        switch(key) {
            case 'name': {
                setForm({
                    ...form,
                    name: value,
                });
                break;
            }
            case 'email': {
                setForm({
                    ...form,
                    email: value,
                });
                break;
            }
            case 'password': {
                setForm({
                    ...form,
                    password: value,
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
        return  form.name !== '' &&
                form.email !== '' &&
                form.password !== '' &&
                isValidEmail(form.email);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(validateForm()) {
            dispatch(signup(form, history));
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
                                WaWChain
                            </div>
                            <div className="auth-form card">
                                <div className="card-header justify-content-center">
                                    <h4 className="card-title">Sign up your account</h4>
                                </div>
                                <div className="card-body">
                                    <form method="post" name="myform" className="signup_validate">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input type="text" className="form-control" placeholder="Full Name" name="name"
                                                onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" className="form-control" placeholder="hello@example.com" name="email"
                                                onChange={handleChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input type="password" className="form-control" placeholder="Password" name="password"
                                                onChange={handleChange} />
                                        </div>
                                        <div className="text-center mt-4">
                                            <Button className="btn btn-success btn-block" onClick={handleSubmit}>Sign up</Button>
                                        </div>
                                    </form>
                                    <div className="new-account mt-3">
                                        <p>Already have an account? <Link className="text-primary" to={"signin"}>Sign in</Link>
                                        </p>
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

export default Signup;