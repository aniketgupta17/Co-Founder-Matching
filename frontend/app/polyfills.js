// Polyfills for Node.js modules used by Supabase
import Stream from 'stream-browserify';
import { EventEmitter } from 'events';

// Set up all required polyfills
global.stream = Stream;
global.EventEmitter = EventEmitter;

// Ensure global.process exists (required by many Node modules)
if (!global.process) {
  global.process = require('process/browser');
}

// Don't set global.path as that causes type errors
// Instead we'll let Metro handle path resolution via extraNodeModules