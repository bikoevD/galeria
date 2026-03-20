import { requireNativeView } from 'expo'

import { useContext } from 'react'
import { Image } from 'react-native'
import {
  controlEdgeToEdgeValues,
  isEdgeToEdge,
} from 'react-native-is-edge-to-edge'
import { GaleriaContext } from './context'
import { GaleriaIndexChangedEvent, GaleriaViewProps } from './Galeria.types'

const EDGE_TO_EDGE = isEdgeToEdge()

const NativeImage = requireNativeView<
  GaleriaViewProps & {
    edgeToEdge: boolean
    urls?: string[]
    theme: 'dark' | 'light'
    showCloseButton?: boolean
    customBackgroundColor?: string
    onIndexChange?: (event: GaleriaIndexChangedEvent) => void
  }
>('Galeria')

const noop = () => {}

const Galeria = Object.assign(
  function Galeria({
    children,
    urls,
    theme = 'dark',
    ids,
    closeIconName,
    hideBlurOverlay = false,
    hidePageIndicators = false,
    backgroundColors,
  }: {
    children: React.ReactNode
  } & Partial<
    Pick<
      GaleriaContext,
      'theme' | 'ids' | 'urls' | 'closeIconName' | 'hideBlurOverlay' | 'hidePageIndicators' | 'backgroundColors'
    >
  >) {
    return (
      <GaleriaContext.Provider
        value={{
          hideBlurOverlay,
          hidePageIndicators,
          closeIconName,
          urls,
          theme,
          initialIndex: 0,
          open: false,
          src: '',
          setOpen: noop,
          ids,
          backgroundColors,
        }}
      >
        {children}
      </GaleriaContext.Provider>
    )
  },
  {
    Image({ edgeToEdge, ...props }: GaleriaViewProps) {
      const { theme, urls, closeIconName, backgroundColors } =
        useContext(GaleriaContext)

      if (__DEV__) {
        controlEdgeToEdgeValues({ edgeToEdge })
      }

      const customBackgroundColor = backgroundColors?.[theme]

      return (
        <NativeImage
          onIndexChange={props.onIndexChange}
          edgeToEdge={EDGE_TO_EDGE || (edgeToEdge ?? false)}
          theme={theme}
          showCloseButton={!!closeIconName}
          customBackgroundColor={customBackgroundColor}
          urls={urls?.map((url) => {
            if (typeof url === 'string') {
              return url
            }

            return Image.resolveAssetSource(url).uri
          })}
          {...props}
        />
      )
    },
    Popup: (() => null) as React.FC<{
      disableTransition?: 'web'
    }>,
  },
)

export default Galeria
