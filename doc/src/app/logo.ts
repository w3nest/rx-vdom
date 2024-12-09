import { AnyVirtualDOM } from 'rx-vdom'

export const logo: AnyVirtualDOM = {
    tag: 'div',
    class: 'd-flex align-items-center',
    children: [
        {
            tag: 'div',
            innerText: '<',
            style: {
                color: 'white',
                fontWeight: 'bolder',
                fontSize: 'x-large',
            },
        },
        {
            tag: 'img',
            class: 'mx-1',
            style: {
                width: '25px',
                height: '25px',
            },
            src: '../assets/reactivex-icon.png',
        },
        {
            tag: 'div',
            innerText: '>',
            style: {
                color: 'white',
                fontWeight: 'bolder',
                fontSize: 'x-large',
            },
        },
    ],
}
