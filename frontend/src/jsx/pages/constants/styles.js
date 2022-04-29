import { makeStyles } from '@mui/styles';
// import { backGrid, boxShadow } from "../../config/style";

const useStyles = makeStyles(() => {
    return {
        cWallet: {
            "& .cwallet-paper": {
                padding: '2rem',
                width: '45rem',
                background: '#29347a',
                "& .title": {
                    borderRadius: '1rem',
                    display: "flex",
                    justifyContent: "space-between",
                    padding: '0.625rem',
                    "& > div": {
                        padding: 0,
                        flexGrow: 1,
                        "& h2": {
                            padding: '1rem 2rem',
                            marginRight: '0.625rem',
                            borderRadius: '1rem',
                            color: "#B8C5EC",
                        }
                    },
                    "& button": {
                        color: "#B8C5EC",
                    },
                    "& h2": {
                        color: "#B8C5EC",
                    },
                },
                "& .content": {
                    padding: '1rem 0 0 0',
                    "& > ul": {
                        paddingBottom: 0,
                        "& .item": {
                            padding: '0.625rem 2rem',
                            margin: '2rem 0',
                            borderRadius: '1rem',
                            cursor: "pointer",
                            "& .symbol": {
                                minWidth: '5.5rem',
                                "& svg": {
                                    fontSize: '3.5rem',
                                },
                                "& img": {
                                    width: `3.5rem !important`
                                }
                            },
                            "& .activating-description": {
                                borderRadius: '1rem',
                                padding: '0.5625rem 2rem',
                                margin: 0,
                                "& p": {
                                    fontSize: '1.375rem'
                                }
                            },
                            "& .description": {
                                borderRadius: '1rem',
                                padding: '1.5rem 2rem',
                                margin: 0,
                            },
                        },
                        "& .action": {
                            "& button": {
                                marginRight: '1rem',
                                "& svg": {
                                }
                            }
                        },
                        "& .state": {
                            paddingTop: '1rem',
                            paddingBottom: '1rem',
                            "& .symbol": {
                                display: "flex",
                                justifyContent: "center",
                                "& .MuiCircularProgress-root": {
                                    width: `35px !important`,
                                    height: `35px !important`
                                }
                            },
                            "& .description": {
                                padding: '1.5rem 2rem',
                            }
                        },
                        "& .activating-item": {
                            marginBottom: 0,
                        }
                    }
                }
            },
        },
        logo: {
            textShadow: "5px 3px 4px #a303db",
            fontFamily: 'cursive !important',
            fontWeight: "bold !important"
        },
        Appbar: {
            background: "rgba(20, 14, 56, 0.9) !important",
            height: "80px",
            justifyContent: "center",
            padding: "43px",
            paddingLeft: "200px",
            paddingRight: "200px",
            "& .header-button": {
                marginRight: "50px",
                fontWeight: "700",
                fontSize: "16px",
                lineHeight: "30px",
                textTransform: "uppercase",
                color: "white",
                transition: "2s",

                // "&:hover": {

                // }
            }
        },
        Footer: {
            background: "#140e38 !important",
            height: "60px",
            paddingLeft: "200px",
            paddingRight: "200px",
            justifyContent: "center",
            "& > div > div ": {
                flexDirection: "row",
                "& > div ": {
                    flexDirection: "row",
                }
            }
        }
    }
});

export default useStyles;