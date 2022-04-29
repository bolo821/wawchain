/* eslint-disable */
import React from 'react';

// Custom auto-complete component.
function Autocomplete(props) {
    const { searchText, setSearchText, items, className } = props;

    return (
        <div className={`position-relative ${className ? className : ''}`}>
            <input type="text" 
                className="form-control" 
                style={{borderColor: '#363C4E'}} 
                placeholder="Please input your token name or address." 
                onChange={e => setSearchText(e.target.value, false)}
                value={searchText}
            />
            {items.length > 0 ?
                <div className="auto-complete-container">
                    {
                        items.map((ele, index) => {
                            return (
                                <p key={index} value={ele.token_id} onClick={() => setSearchText(ele.token_id, true)}>
                                    <span className="mr-2">
                                        {ele.content.name}
                                    </span>
                                    <span>{ele.token_id}</span>
                                </p>
                            )
                        })
                    }
                </div>
            : ''}
        </div>
    )
}

export default Autocomplete;