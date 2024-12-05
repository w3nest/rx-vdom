type AllTags = keyof HTMLElementTagNameMap
export interface Configuration {
    TypeCheck: 'strict'
    SupportedHTMLTags: 'Dev' extends 'Prod' ? AllTags : DevTags
    WithFluxView: false
}

type DevTags =
    | 'div'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'img'
    | 'a'
    | 'i'
    | 'span'
    | 'li'
    | 'ul'
    | 'input'
    | 'button'
    | 'pre'
    | 'footer'
