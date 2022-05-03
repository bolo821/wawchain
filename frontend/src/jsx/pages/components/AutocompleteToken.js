/* eslint-disable */
import React from 'react';
import { getDecimal } from '../api/helpers';

// Custom auto-complete component.
const AutocompleteToken = props => {
    const { searchText, setSearchText, items, setToken, className } = props;

    const handleItemClick = async ele => {
        setSearchText(`${ele.content.name}(${ele.content.symbol})`, true);

        let decimal = 18;
        if (ele.token_id !== process.env.REACT_APP_NATIVE_COIN_ADDRESS) {
            decimal = await getDecimal(ele.token_id);
        }
        
        setToken({
            address: ele.token_id,
            name: ele.content.name,
            symbol: ele.content.symbol,
            decimal: decimal,
        });
    }

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
                                <p key={index} value={ele.token_id} onClick={() => {handleItemClick(ele)}}>
                                    <span className="mr-2">
                                        {`${ele.content.name}(${ele.content.symbol})`}
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

export default AutocompleteToken;