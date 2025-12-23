import {createTheme} from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';

export default class SseTheme {
    constructor() {
        this.theme = createTheme({
            palette: {
                type: "dark",
                main: pink,
                primary: {
                    50: '#ffffff',
                    100: '#eeeeee',
                    200: '#dddddd',
                    300: '#cccccc',
                    400: '#bbbbbb',
                    500: '#aaaaaa',
                    600: '#999999',
                    700: '#888888',
                    800: '#777777',
                    900: '#707070',
                    A100: '#656565',
                    A200: '#606060',
                    A400: '#555555',
                    A700: '#505050',
                },
                secondary: red,
                action: pink,
                error: red,
                contrastThreshold: 3,
                tonalOffset: 0.2,
            },
            typography: {
                body1: {
                    fontSize: 13,
                },
                button: {
                    lineHeight: "1.35em",
                },
            },
            overrides: {
                MuiOutlinedInput: {
                    input: {
                        paddingTop: 12,
                        paddingBottom: 12,
                    },
                },
            },
        });
    }
}