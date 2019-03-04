'use strict'

import ed from 'express-device'

const device = {}

/**
 * Returns information about your OS
 */
device.get = () => {
  ed.capture()
  // let type = 'unknown'
  // let name = ''

  // if (ed.capture() !== -1) {
  //   type = 'windows'
  //   name = 'Windows'
  // } else if (o.type() === 'Darwin') {
  //   type = 'macos'
  //   name = 'macOS'
  // } else if (o.type() === 'Linux') {
  //   type = 'linux'
  //   name = 'Linux'
  // }

  // return { type, name }
}

export default device