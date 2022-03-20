
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe$1(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe$1(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const { set, subscribe } = writable({});

    const remove = () => {
      set({});
    };

    const activeRoute = {
      subscribe,
      set,
      remove,
    };

    const UrlParser = (urlString, namedUrl = '') => {
      const urlBase = new URL(urlString);

      /**
       * Wrapper for URL.hash
       *
       **/
      function hash() {
        return urlBase.hash;
      }

      /**
       * Wrapper for URL.host
       *
       **/
      function host() {
        return urlBase.host;
      }

      /**
       * Wrapper for URL.hostname
       *
       **/
      function hostname() {
        return urlBase.hostname;
      }

      /**
       * Returns an object with all the named params and their values
       *
       **/
      function namedParams() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values[paramKey.value] = allPathName[paramKey.index];
          return values;
        }, {});
      }

      /**
       * Returns an array with all the named param keys
       *
       **/
      function namedParamsKeys() {
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(paramKey.value);
          return values;
        }, []);
      }

      /**
       * Returns an array with all the named param values
       *
       **/
      function namedParamsValues() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(allPathName[paramKey.index]);
          return values;
        }, []);
      }

      /**
       * Returns an array with all named param ids and their position in the path
       * Private
       **/
      function namedParamsWithIndex() {
        const namedUrlParams = getPathNames(namedUrl);

        return namedUrlParams.reduce((validParams, param, index) => {
          if (param[0] === ':') {
            validParams.push({ value: param.slice(1), index });
          }
          return validParams;
        }, []);
      }

      /**
       * Wrapper for URL.port
       *
       **/
      function port() {
        return urlBase.port;
      }

      /**
       * Wrapper for URL.pathname
       *
       **/
      function pathname() {
        return urlBase.pathname;
      }

      /**
       * Wrapper for URL.protocol
       *
       **/
      function protocol() {
        return urlBase.protocol;
      }

      /**
       * Wrapper for URL.search
       *
       **/
      function search() {
        return urlBase.search;
      }

      /**
       * Returns an object with all query params and their values
       *
       **/
      function queryParams() {
        const params = {};
        urlBase.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return params;
      }

      /**
       * Returns an array with all the query param keys
       *
       **/
      function queryParamsKeys() {
        const params = [];
        urlBase.searchParams.forEach((_value, key) => {
          params.push(key);
        });

        return params;
      }

      /**
       * Returns an array with all the query param values
       *
       **/
      function queryParamsValues() {
        const params = [];
        urlBase.searchParams.forEach((value) => {
          params.push(value);
        });

        return params;
      }

      /**
       * Returns an array with all the elements of a pathname
       *
       **/
      function pathNames() {
        return getPathNames(urlBase.pathname);
      }

      /**
       * Returns an array with all the parts of a pathname
       * Private method
       **/
      function getPathNames(pathName) {
        if (pathName === '/' || pathName.trim().length === 0) return [pathName];
        if (pathName.slice(-1) === '/') {
          pathName = pathName.slice(0, -1);
        }
        if (pathName[0] === '/') {
          pathName = pathName.slice(1);
        }

        return pathName.split('/');
      }

      return Object.freeze({
        hash: hash(),
        host: host(),
        hostname: hostname(),
        namedParams: namedParams(),
        namedParamsKeys: namedParamsKeys(),
        namedParamsValues: namedParamsValues(),
        pathNames: pathNames(),
        port: port(),
        pathname: pathname(),
        protocol: protocol(),
        search: search(),
        queryParams: queryParams(),
        queryParamsKeys: queryParamsKeys(),
        queryParamsValues: queryParamsValues(),
      });
    };

    /**
     * Returns true if object has any nested routes empty
     * @param routeObject
     **/
    const anyEmptyNestedRoutes = (routeObject) => {
      let result = false;
      if (Object.keys(routeObject).length === 0) {
        return true;
      }

      if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
        result = true;
      } else if (routeObject.childRoute) {
        result = anyEmptyNestedRoutes(routeObject.childRoute);
      }

      return result;
    };

    /**
     * Compare two routes ignoring named params
     * @param pathName string
     * @param routeName string
     **/

    const compareRoutes = (pathName, routeName) => {
      routeName = removeSlash(routeName);

      if (routeName.includes(':')) {
        return routeName.includes(pathName);
      } else {
        return routeName.startsWith(pathName);
      }
    };

    /**
     * Returns a boolean indicating if the name of path exists in the route based on the language parameter
     * @param pathName string
     * @param route object
     * @param language string
     **/

    const findLocalisedRoute = (pathName, route, language) => {
      let exists = false;

      if (language) {
        return { exists: route.lang && route.lang[language] && route.lang[language].includes(pathName), language };
      }

      exists = compareRoutes(pathName, route.name);

      if (!exists && route.lang && typeof route.lang === 'object') {
        for (const [key, value] of Object.entries(route.lang)) {
          if (compareRoutes(pathName, value)) {
            exists = true;
            language = key;
          }
        }
      }

      return { exists, language };
    };

    /**
     * Return all the consecutive named param (placeholders) of a pathname
     * @param pathname
     **/
    const getNamedParams = (pathName = '') => {
      if (pathName.trim().length === 0) return [];
      const namedUrlParams = getPathNames(pathName);
      return namedUrlParams.reduce((validParams, param) => {
        if (param[0] === ':') {
          validParams.push(param.slice(1));
        }

        return validParams;
      }, []);
    };

    /**
     * Split a pathname based on /
     * @param pathName
     * Private method
     **/
    const getPathNames = (pathName) => {
      if (pathName === '/' || pathName.trim().length === 0) return [pathName];

      pathName = removeSlash(pathName, 'both');

      return pathName.split('/');
    };

    /**
     * Return the first part of a pathname until the first named param is found
     * @param name
     **/
    const nameToPath = (name = '') => {
      let routeName;
      if (name === '/' || name.trim().length === 0) return name;
      name = removeSlash(name, 'lead');
      routeName = name.split(':')[0];
      routeName = removeSlash(routeName, 'trail');

      return routeName.toLowerCase();
    };

    /**
     * Return the path name excluding query params
     * @param name
     **/
    const pathWithoutQueryParams = (currentRoute) => {
      const path = currentRoute.path.split('?');
      return path[0];
    };

    /**
     * Return the path name including query params
     * @param name
     **/
    const pathWithQueryParams = (currentRoute) => {
      let queryParams = [];
      if (currentRoute.queryParams) {
        for (let [key, value] of Object.entries(currentRoute.queryParams)) {
          queryParams.push(`${key}=${value}`);
        }
      }

      const hash = currentRoute.hash ? currentRoute.hash : '';

      if (queryParams.length > 0) {
        return `${currentRoute.path}?${queryParams.join('&')}${hash}`;
      } else {
        return currentRoute.path + hash;
      }
    };

    /**
     * Returns a string with trailing or leading slash character removed
     * @param pathName string
     * @param position string - lead, trail, both
     **/
    const removeExtraPaths = (pathNames, basePathNames) => {
      const names = basePathNames.split('/');
      if (names.length > 1) {
        names.forEach(function (name, index) {
          if (name.length > 0 && index > 0) {
            pathNames.shift();
          }
        });
      }

      return pathNames;
    };

    /**
     * Returns a string with trailing or leading slash character removed
     * @param pathName string
     * @param position string - lead, trail, both
     **/

    const removeSlash = (pathName, position = 'lead') => {
      if (position === 'trail' || position === 'both') {
        pathName = pathName.replace(/\/$/, '');
      }

      if (position === 'lead' || position === 'both') {
        pathName = pathName.replace(/^\//, '');
      }

      return pathName;
    };

    /**
     * Returns the name of the route based on the language parameter
     * @param route object
     * @param language string
     **/

    const routeNameLocalised = (route, language = null) => {
      if (!language || !route.lang || !route.lang[language]) {
        return route.name;
      } else {
        return route.lang[language];
      }
    };

    /**
     * Return the path name excluding query params
     * @param name
     **/
    const startsWithNamedParam = (currentRoute) => {
      const routeName = removeSlash(currentRoute);

      return routeName.startsWith(':');
    };

    /**
     * Updates the base route path.
     * Route objects can have nested routes (childRoutes) or just a long name like "admin/employees/show/:id"
     *
     * @param basePath string
     * @param pathNames array
     * @param route object
     * @param language string
     **/

    const updateRoutePath = (basePath, pathNames, route, language, convert = false) => {
      if (basePath === '/' || basePath.trim().length === 0) return { result: basePath, language: null };

      let basePathResult = basePath;
      let routeName = route.name;
      let currentLanguage = language;

      if (convert) {
        currentLanguage = '';
      }

      routeName = removeSlash(routeName);
      basePathResult = removeSlash(basePathResult);

      if (!route.childRoute) {
        let localisedRoute = findLocalisedRoute(basePathResult, route, currentLanguage);

        if (localisedRoute.exists && convert) {
          basePathResult = routeNameLocalised(route, language);
        }

        let routeNames = routeName.split(':')[0];
        routeNames = removeSlash(routeNames, 'trail');
        routeNames = routeNames.split('/');
        routeNames.shift();
        routeNames.forEach(() => {
          const currentPathName = pathNames[0];
          localisedRoute = findLocalisedRoute(`${basePathResult}/${currentPathName}`, route, currentLanguage);

          if (currentPathName && localisedRoute.exists) {
            if (convert) {
              basePathResult = routeNameLocalised(route, language);
            } else {
              basePathResult = `${basePathResult}/${currentPathName}`;
            }
            pathNames.shift();
          } else {
            return { result: basePathResult, language: localisedRoute.language };
          }
        });
        return { result: basePathResult, language: localisedRoute.language };
      } else {
        return { result: basePath, language: currentLanguage };
      }
    };

    const RouterCurrent = (trackPage) => {
      const trackPageview = trackPage || false;
      let activeRoute = '';

      const setActive = (newRoute, updateBrowserHistory) => {
        activeRoute = newRoute.path;
        pushActiveRoute(newRoute, updateBrowserHistory);
      };

      const active = () => {
        return activeRoute;
      };

      /**
       * Returns true if pathName is current active route
       * @param pathName String The path name to check against the current route.
       * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
       **/
      const isActive = (queryPath, includePath = false) => {
        if (queryPath[0] !== '/') {
          queryPath = '/' + queryPath;
        }

        // remove query params for comparison
        let pathName = UrlParser(`http://fake.com${queryPath}`).pathname;
        let activeRoutePath = UrlParser(`http://fake.com${activeRoute}`).pathname;

        pathName = removeSlash(pathName, 'trail');

        activeRoutePath = removeSlash(activeRoutePath, 'trail');

        if (includePath) {
          return activeRoutePath.includes(pathName);
        } else {
          return activeRoutePath === pathName;
        }
      };

      const pushActiveRoute = (newRoute, updateBrowserHistory) => {
        if (typeof window !== 'undefined') {
          const pathAndSearch = pathWithQueryParams(newRoute);

          if (updateBrowserHistory) {
            window.history.pushState({ page: pathAndSearch }, '', pathAndSearch);
          }
          // Moving back in history does not update browser history but does update tracking.
          if (trackPageview) {
            gaTracking(pathAndSearch);
          }
        }
      };

      const gaTracking = (newPage) => {
        if (typeof ga !== 'undefined') {
          ga('set', 'page', newPage);
          ga('send', 'pageview');
        }
      };

      return Object.freeze({ active, isActive, setActive });
    };

    const RouterGuard = (onlyIf) => {
      const guardInfo = onlyIf;

      const valid = () => {
        return guardInfo && guardInfo.guard && typeof guardInfo.guard === 'function';
      };

      const redirect = () => {
        return !guardInfo.guard();
      };

      const redirectPath = () => {
        let destinationUrl = '/';
        if (guardInfo.redirect && guardInfo.redirect.length > 0) {
          destinationUrl = guardInfo.redirect;
        }

        return destinationUrl;
      };

      return Object.freeze({ valid, redirect, redirectPath });
    };

    const RouterRedirect = (route, currentPath) => {
      const guard = RouterGuard(route.onlyIf);

      const path = () => {
        let redirectTo = currentPath;
        if (route.redirectTo && route.redirectTo.length > 0) {
          redirectTo = route.redirectTo;
        }

        if (guard.valid() && guard.redirect()) {
          redirectTo = guard.redirectPath();
        }

        return redirectTo;
      };

      return Object.freeze({ path });
    };

    function RouterRoute({ routeInfo, path, routeNamedParams, urlParser, namedPath, language }) {
      const namedParams = () => {
        const parsedParams = UrlParser(`https://fake.com${urlParser.pathname}`, namedPath).namedParams;

        return { ...routeNamedParams, ...parsedParams };
      };

      const get = () => {
        return {
          name: path,
          component: routeInfo.component,
          hash: urlParser.hash,
          layout: routeInfo.layout,
          queryParams: urlParser.queryParams,
          namedParams: namedParams(),
          path,
          language,
        };
      };

      return Object.freeze({ get, namedParams });
    }

    function RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage }) {
      let updatedPathRoute;
      let route;
      let routePathLanguage = currentLanguage;

      function updatedPath(currentRoute) {
        route = currentRoute;
        updatedPathRoute = updateRoutePath(basePathName, pathNames, route, routePathLanguage, convert);
        routePathLanguage = convert ? currentLanguage : updatedPathRoute.language;

        return updatedPathRoute;
      }

      function localisedPathName() {
        return routeNameLocalised(route, routePathLanguage);
      }

      function localisedRouteWithoutNamedParams() {
        return nameToPath(localisedPathName());
      }

      function basePathNameWithoutNamedParams() {
        return nameToPath(updatedPathRoute.result);
      }

      function namedPath() {
        let localisedPath = localisedPathName();
        if (localisedPath && !localisedPath.startsWith('/')) {
          localisedPath = '/' + localisedPath;
        }

        return basePath ? `${basePath}${localisedPath}` : localisedPath;
      }

      function routePath() {
        let routePathValue = `${basePath}/${basePathNameWithoutNamedParams()}`;
        if (routePathValue === '//') {
          routePathValue = '/';
        }

        if (routePathLanguage) {
          pathNames = removeExtraPaths(pathNames, localisedRouteWithoutNamedParams());
        }

        const namedParams = getNamedParams(localisedPathName());
        if (namedParams && namedParams.length > 0) {
          namedParams.forEach(function () {
            if (pathNames.length > 0) {
              routePathValue += `/${pathNames.shift()}`;
            }
          });
        }

        return routePathValue;
      }

      function routeLanguage() {
        return routePathLanguage;
      }

      function basePathSameAsLocalised() {
        return basePathNameWithoutNamedParams() === localisedRouteWithoutNamedParams();
      }

      return Object.freeze({
        basePathSameAsLocalised,
        updatedPath,
        basePathNameWithoutNamedParams,
        localisedPathName,
        localisedRouteWithoutNamedParams,
        namedPath,
        pathNames,
        routeLanguage,
        routePath,
      });
    }

    const NotFoundPage$1 = '/404.html';

    function RouterFinder({ routes, currentUrl, routerOptions, convert }) {
      const defaultLanguage = routerOptions.defaultLanguage;
      const sitePrefix = routerOptions.prefix ? routerOptions.prefix.toLowerCase() : '';
      const urlParser = parseCurrentUrl(currentUrl, sitePrefix);
      let redirectTo = '';
      let routeNamedParams = {};
      let staticParamMatch = false;

      function findActiveRoute() {
        let searchActiveRoute = searchActiveRoutes(routes, '', urlParser.pathNames, routerOptions.lang, convert);

        if (!searchActiveRoute || !Object.keys(searchActiveRoute).length || anyEmptyNestedRoutes(searchActiveRoute)) {
          if (typeof window !== 'undefined') {
            searchActiveRoute = routeNotFound(routerOptions.lang);
          }
        } else {
          searchActiveRoute.path = pathWithoutQueryParams(searchActiveRoute);
          if (sitePrefix) {
            searchActiveRoute.path = `/${sitePrefix}${searchActiveRoute.path}`;
          }
        }

        return searchActiveRoute;
      }

      /**
       * Gets an array of routes and the browser pathname and return the active route
       * @param routes
       * @param basePath
       * @param pathNames
       **/
      function searchActiveRoutes(routes, basePath, pathNames, currentLanguage, convert) {
        let currentRoute = {};
        let basePathName = pathNames.shift().toLowerCase();
        const routerPath = RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage });
        staticParamMatch = false;

        routes.forEach(function (route) {
          routerPath.updatedPath(route);

          if (matchRoute(routerPath, route.name)) {
            let routePath = routerPath.routePath();
            redirectTo = RouterRedirect(route, redirectTo).path();

            if (currentRoute.name !== routePath) {
              currentRoute = setCurrentRoute({
                route,
                routePath,
                routeLanguage: routerPath.routeLanguage(),
                urlParser,
                namedPath: routerPath.namedPath(),
              });
            }

            if (route.nestedRoutes && route.nestedRoutes.length > 0 && routerPath.pathNames.length > 0) {
              currentRoute.childRoute = searchActiveRoutes(
                route.nestedRoutes,
                routePath,
                routerPath.pathNames,
                routerPath.routeLanguage(),
                convert
              );
              currentRoute.path = currentRoute.childRoute.path;
              currentRoute.language = currentRoute.childRoute.language;
            } else if (nestedRoutesAndNoPath(route, routerPath.pathNames)) {
              const indexRoute = searchActiveRoutes(
                route.nestedRoutes,
                routePath,
                ['index'],
                routerPath.routeLanguage(),
                convert
              );
              if (indexRoute && Object.keys(indexRoute).length > 0) {
                currentRoute.childRoute = indexRoute;
                currentRoute.language = currentRoute.childRoute.language;
              }
            }
          }
        });

        if (redirectTo) {
          currentRoute.redirectTo = redirectTo;
        }

        return currentRoute;
      }

      function matchRoute(routerPath, routeName) {
        const basePathSameAsLocalised = routerPath.basePathSameAsLocalised();
        if (basePathSameAsLocalised) {
          staticParamMatch = true;
        }

        return basePathSameAsLocalised || (!staticParamMatch && startsWithNamedParam(routeName));
      }

      function nestedRoutesAndNoPath(route, pathNames) {
        return route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0;
      }

      function parseCurrentUrl(currentUrl, sitePrefix) {
        if (sitePrefix && sitePrefix.trim().length > 0) {
          const replacePattern = currentUrl.endsWith(sitePrefix) ? sitePrefix : sitePrefix + "/";
          const noPrefixUrl = currentUrl.replace(replacePattern, '');
          return UrlParser(noPrefixUrl);
        } else {
          return UrlParser(currentUrl);
        }
      }

      function setCurrentRoute({ route, routePath, routeLanguage, urlParser, namedPath }) {
        const routerRoute = RouterRoute({
          routeInfo: route,
          urlParser,
          path: routePath,
          routeNamedParams,
          namedPath,
          language: routeLanguage || defaultLanguage,
        });
        routeNamedParams = routerRoute.namedParams();

        return routerRoute.get();
      }

      const routeNotFound = (customLanguage) => {
        const custom404Page = routes.find((route) => route.name == '404');
        const language = customLanguage || defaultLanguage || '';
        if (custom404Page) {
          return { ...custom404Page, language, path: '404' };
        } else {
          return { name: '404', component: '', path: '404', redirectTo: NotFoundPage$1 };
        }
      };

      return Object.freeze({ findActiveRoute });
    }

    const NotFoundPage = '/404.html';

    let userDefinedRoutes = [];
    let routerOptions = {};
    let routerCurrent;

    /**
     * Object exposes one single property: activeRoute
     * @param routes  Array of routes
     * @param currentUrl current url
     * @param options configuration options
     **/
    const SpaRouter = (routes, currentUrl, options = {}) => {
      routerOptions = { ...options };
      if (typeof currentUrl === 'undefined' || currentUrl === '') {
        currentUrl = document.location.href;
      }

      routerCurrent = RouterCurrent(routerOptions.gaPageviews);

      currentUrl = removeSlash(currentUrl, 'trail');
      userDefinedRoutes = routes;

      const findActiveRoute = () => {
        let convert = false;

        if (routerOptions.langConvertTo) {
          routerOptions.lang = routerOptions.langConvertTo;
          convert = true;
        }

        return RouterFinder({ routes, currentUrl, routerOptions, convert }).findActiveRoute();
      };

      /**
       * Redirect current route to another
       * @param destinationUrl
       **/
      const navigateNow = (destinationUrl, updateBrowserHistory) => {
        if (typeof window !== 'undefined') {
          if (destinationUrl === NotFoundPage) {
            routerCurrent.setActive({ path: NotFoundPage }, updateBrowserHistory);
          } else {
            navigateTo(destinationUrl);
          }
        }

        return destinationUrl;
      };

      const setActiveRoute = (updateBrowserHistory = true) => {
        const currentRoute = findActiveRoute();
        if (currentRoute.redirectTo) {
          return navigateNow(currentRoute.redirectTo, updateBrowserHistory);
        }

        routerCurrent.setActive(currentRoute, updateBrowserHistory);
        activeRoute.set(currentRoute);

        return currentRoute;
      };

      return Object.freeze({
        setActiveRoute,
        findActiveRoute,
      });
    };

    /**
     * Converts a route to its localised version
     * @param pathName
     **/
    const localisedRoute = (pathName, language) => {
      pathName = removeSlash(pathName, 'lead');
      routerOptions.langConvertTo = language;

      return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).findActiveRoute();
    };

    /**
     * Updates the current active route and updates the browser pathname
     * @param pathName String
     * @param language String
     * @param updateBrowserHistory Boolean
     **/
    const navigateTo = (pathName, language = null, updateBrowserHistory = true) => {
      pathName = removeSlash(pathName, 'lead');

      if (language) {
        routerOptions.langConvertTo = language;
      }

      return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).setActiveRoute(
        updateBrowserHistory
      );
    };

    /**
     * Returns true if pathName is current active route
     * @param pathName String The path name to check against the current route.
     * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
     **/
    const routeIsActive = (queryPath, includePath = false) => {
      return routerCurrent.isActive(queryPath, includePath);
    };

    if (typeof window !== 'undefined') {
      // Avoid full page reload on local routes
      window.addEventListener('click', (event) => {
        if (event.target.localName.toLowerCase() !== 'a') return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;

        const sitePrefix = routerOptions.prefix ? `/${routerOptions.prefix.toLowerCase()}` : '';
        const targetHostNameInternal = event.target.pathname && event.target.host === window.location.host;
        const prefixMatchPath = sitePrefix.length > 1 ? event.target.pathname.startsWith(sitePrefix) : true;

        if (targetHostNameInternal && prefixMatchPath) {
          event.preventDefault();
          let navigatePathname = event.target.pathname + event.target.search;

          const destinationUrl = navigatePathname + event.target.search + event.target.hash;
          if (event.target.target === '_blank') {
            window.open(destinationUrl, 'newTab');
          } else {
            navigateTo(destinationUrl);
          }
        }
      });

      window.onpopstate = function (_event) {
        let navigatePathname = window.location.pathname + window.location.search + window.location.hash;

        navigateTo(navigatePathname, null, false);
      };
    }

    /* node_modules\svelte-router-spa\src\components\route.svelte generated by Svelte v3.46.4 */

    // (10:34) 
    function create_if_block_2$2(ctx) {
    	let route;
    	let current;

    	route = new Route({
    			props: {
    				currentRoute: /*currentRoute*/ ctx[0].childRoute,
    				params: /*params*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_changes = {};
    			if (dirty & /*currentRoute*/ 1) route_changes.currentRoute = /*currentRoute*/ ctx[0].childRoute;
    			if (dirty & /*params*/ 2) route_changes.params = /*params*/ ctx[1];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(10:34) ",
    		ctx
    	});

    	return block;
    }

    // (8:33) 
    function create_if_block_1$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*currentRoute*/ ctx[0].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				currentRoute: {
    					.../*currentRoute*/ ctx[0],
    					component: ''
    				},
    				params: /*params*/ ctx[1]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty & /*currentRoute*/ 1) switch_instance_changes.currentRoute = {
    				.../*currentRoute*/ ctx[0],
    				component: ''
    			};

    			if (dirty & /*params*/ 2) switch_instance_changes.params = /*params*/ ctx[1];

    			if (switch_value !== (switch_value = /*currentRoute*/ ctx[0].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(8:33) ",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if currentRoute.layout}
    function create_if_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*currentRoute*/ ctx[0].layout;

    	function switch_props(ctx) {
    		return {
    			props: {
    				currentRoute: { .../*currentRoute*/ ctx[0], layout: '' },
    				params: /*params*/ ctx[1]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*currentRoute*/ 1) switch_instance_changes.currentRoute = { .../*currentRoute*/ ctx[0], layout: '' };
    			if (dirty & /*params*/ 2) switch_instance_changes.params = /*params*/ ctx[1];

    			if (switch_value !== (switch_value = /*currentRoute*/ ctx[0].layout)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(6:0) {#if currentRoute.layout}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_if_block_1$3, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentRoute*/ ctx[0].layout) return 0;
    		if (/*currentRoute*/ ctx[0].component) return 1;
    		if (/*currentRoute*/ ctx[0].childRoute) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, []);
    	let { currentRoute = {} } = $$props;
    	let { params = {} } = $$props;
    	const writable_props = ['currentRoute', 'params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('currentRoute' in $$props) $$invalidate(0, currentRoute = $$props.currentRoute);
    		if ('params' in $$props) $$invalidate(1, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({ currentRoute, params });

    	$$self.$inject_state = $$props => {
    		if ('currentRoute' in $$props) $$invalidate(0, currentRoute = $$props.currentRoute);
    		if ('params' in $$props) $$invalidate(1, params = $$props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentRoute, params];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { currentRoute: 0, params: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get currentRoute() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get params() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-router-spa\src\components\router.svelte generated by Svelte v3.46.4 */

    function create_fragment$c(ctx) {
    	let route;
    	let current;

    	route = new Route({
    			props: { currentRoute: /*$activeRoute*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route_changes = {};
    			if (dirty & /*$activeRoute*/ 1) route_changes.currentRoute = /*$activeRoute*/ ctx[0];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(0, $activeRoute = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = [] } = $$props;
    	let { options = {} } = $$props;

    	onMount(() => {
    		SpaRouter(routes, document.location.href, options).setActiveRoute();
    	});

    	const writable_props = ['routes', 'options'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(1, routes = $$props.routes);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		SpaRouter,
    		Route,
    		activeRoute,
    		routes,
    		options,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(1, routes = $$props.routes);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$activeRoute, routes, options];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { routes: 1, options: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-router-spa\src\components\navigate.svelte generated by Svelte v3.46.4 */
    const file$b = "node_modules\\svelte-router-spa\\src\\components\\navigate.svelte";

    function create_fragment$b(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", /*to*/ ctx[0]);
    			attr_dev(a, "title", /*title*/ ctx[1]);
    			attr_dev(a, "class", /*styles*/ ctx[2]);
    			toggle_class(a, "active", routeIsActive(/*to*/ ctx[0]));
    			add_location(a, file$b, 26, 0, 560);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*navigate*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*to*/ 1) {
    				attr_dev(a, "href", /*to*/ ctx[0]);
    			}

    			if (!current || dirty & /*title*/ 2) {
    				attr_dev(a, "title", /*title*/ ctx[1]);
    			}

    			if (!current || dirty & /*styles*/ 4) {
    				attr_dev(a, "class", /*styles*/ ctx[2]);
    			}

    			if (dirty & /*styles, routeIsActive, to*/ 5) {
    				toggle_class(a, "active", routeIsActive(/*to*/ ctx[0]));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navigate', slots, ['default']);
    	let { to = '/' } = $$props;
    	let { title = '' } = $$props;
    	let { styles = '' } = $$props;
    	let { lang = null } = $$props;

    	onMount(() => {
    		if (lang) {
    			const route = localisedRoute(to, lang);

    			if (route) {
    				$$invalidate(0, to = route.path);
    			}
    		}
    	});

    	const navigate = event => {
    		if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    		event.preventDefault();
    		event.stopPropagation();
    		navigateTo(to);
    	};

    	const writable_props = ['to', 'title', 'styles', 'lang'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navigate> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('to' in $$props) $$invalidate(0, to = $$props.to);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('styles' in $$props) $$invalidate(2, styles = $$props.styles);
    		if ('lang' in $$props) $$invalidate(4, lang = $$props.lang);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		localisedRoute,
    		navigateTo,
    		routeIsActive,
    		to,
    		title,
    		styles,
    		lang,
    		navigate
    	});

    	$$self.$inject_state = $$props => {
    		if ('to' in $$props) $$invalidate(0, to = $$props.to);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('styles' in $$props) $$invalidate(2, styles = $$props.styles);
    		if ('lang' in $$props) $$invalidate(4, lang = $$props.lang);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [to, title, styles, navigate, lang, $$scope, slots];
    }

    class Navigate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { to: 0, title: 1, styles: 2, lang: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigate",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get to() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function paginate ({ items, pageSize, currentPage }) {
      return items
        .slice(
          (currentPage - 1) * pageSize,
          (currentPage - 1) * pageSize + pageSize
        )
    }

    const PREVIOUS_PAGE = 'PREVIOUS_PAGE';
    const NEXT_PAGE = 'NEXT_PAGE';
    const ELLIPSIS = 'ELLIPSIS';

    function generateNavigationOptions ({ totalItems, pageSize, currentPage, limit = null, showStepOptions = false })  {
      const totalPages = Math.ceil(totalItems / pageSize);
      const limitThreshold = getLimitThreshold({ limit });
      const limited = limit && totalPages > limitThreshold;
      let options = limited
        ? generateLimitedOptions({ totalPages, limit, currentPage })
        : generateUnlimitedOptions({ totalPages });
      return showStepOptions
        ? addStepOptions({ options, currentPage, totalPages })
        : options
    }

    function generateUnlimitedOptions ({ totalPages }) {
      return new Array(totalPages)
        .fill(null)
        .map((value, index) => ({
          type: 'number',
          value: index + 1
        }))
    }

    function generateLimitedOptions ({ totalPages, limit, currentPage }) {
      const boundarySize = limit * 2 + 2;
      const firstBoundary = 1 + boundarySize;
      const lastBoundary = totalPages - boundarySize;
      const totalShownPages = firstBoundary + 2;

      if (currentPage <= firstBoundary - limit) {
        return Array(totalShownPages)
          .fill(null)
          .map((value, index) => {
            if (index === totalShownPages - 1) {
              return {
                type: 'number',
                value: totalPages
              }
            } else if (index === totalShownPages - 2) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: firstBoundary + 1
              }
            }
            return {
              type: 'number',
              value: index + 1
            }
          })
      } else if (currentPage >= lastBoundary + limit) {
        return Array(totalShownPages)
          .fill(null)
          .map((value, index) => {
            if (index === 0) {
              return {
                type: 'number',
                value: 1
              }
            } else if (index === 1) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: lastBoundary - 1
              }
            }
            return {
              type: 'number',
              value: lastBoundary + index - 2
            }
          })
      } else if (currentPage >= (firstBoundary - limit) && currentPage <= (lastBoundary + limit)) {
        return Array(totalShownPages)
          .fill(null)
          .map((value, index) => {
            if (index === 0) {
              return {
                type: 'number',
                value: 1
              }
            } else if (index === 1) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: currentPage - limit + (index - 2)
              }
            } else if (index === totalShownPages - 1) {
              return {
                type: 'number',
                value: totalPages
              }
            } else if (index === totalShownPages - 2) {
              return {
                type: 'symbol',
                symbol: ELLIPSIS,
                value: currentPage + limit + 1
              }
            }
            return {
              type: 'number',
              value: currentPage - limit + (index - 2)
            }
          })
      }
    }

    function addStepOptions ({ options, currentPage, totalPages }) {
      return [
        {
          type: 'symbol',
          symbol: PREVIOUS_PAGE,
          value: currentPage <= 1 ? 1 : currentPage - 1
        },
        ...options,
        {
          type: 'symbol',
          symbol: NEXT_PAGE,
          value: currentPage >= totalPages ? totalPages : currentPage + 1
        }
      ]
    }

    function getLimitThreshold ({ limit }) {
      const maximumUnlimitedPages = 3; // This means we cannot limit 3 pages or less
      const numberOfBoundaryPages = 2; // The first and last pages are always shown
      return limit * 2 + maximumUnlimitedPages + numberOfBoundaryPages
    }

    /* node_modules\svelte-paginate\src\PaginationNav.svelte generated by Svelte v3.46.4 */
    const file$a = "node_modules\\svelte-paginate\\src\\PaginationNav.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_prev_slot_changes = dirty => ({});
    const get_prev_slot_context = ctx => ({});
    const get_ellipsis_slot_changes = dirty => ({});
    const get_ellipsis_slot_context = ctx => ({});
    const get_number_slot_changes = dirty => ({ value: dirty & /*options*/ 4 });
    const get_number_slot_context = ctx => ({ value: /*option*/ ctx[12].value });

    // (68:72) 
    function create_if_block_3(ctx) {
    	let current;
    	const next_slot_template = /*#slots*/ ctx[9].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[8], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						next_slot,
    						next_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(next_slot_template, /*$$scope*/ ctx[8], dirty, get_next_slot_changes),
    						get_next_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(68:72) ",
    		ctx
    	});

    	return block;
    }

    // (56:76) 
    function create_if_block_2$1(ctx) {
    	let current;
    	const prev_slot_template = /*#slots*/ ctx[9].prev;
    	const prev_slot = create_slot(prev_slot_template, ctx, /*$$scope*/ ctx[8], get_prev_slot_context);
    	const prev_slot_or_fallback = prev_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (prev_slot_or_fallback) {
    				prev_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prev_slot) {
    				if (prev_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						prev_slot,
    						prev_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(prev_slot_template, /*$$scope*/ ctx[8], dirty, get_prev_slot_changes),
    						get_prev_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prev_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prev_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(56:76) ",
    		ctx
    	});

    	return block;
    }

    // (52:71) 
    function create_if_block_1$2(ctx) {
    	let current;
    	const ellipsis_slot_template = /*#slots*/ ctx[9].ellipsis;
    	const ellipsis_slot = create_slot(ellipsis_slot_template, ctx, /*$$scope*/ ctx[8], get_ellipsis_slot_context);
    	const ellipsis_slot_or_fallback = ellipsis_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (ellipsis_slot_or_fallback) ellipsis_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (ellipsis_slot_or_fallback) {
    				ellipsis_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (ellipsis_slot) {
    				if (ellipsis_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						ellipsis_slot,
    						ellipsis_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(ellipsis_slot_template, /*$$scope*/ ctx[8], dirty, get_ellipsis_slot_changes),
    						get_ellipsis_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ellipsis_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ellipsis_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (ellipsis_slot_or_fallback) ellipsis_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(52:71) ",
    		ctx
    	});

    	return block;
    }

    // (48:6) {#if option.type === 'number'}
    function create_if_block$3(ctx) {
    	let current;
    	const number_slot_template = /*#slots*/ ctx[9].number;
    	const number_slot = create_slot(number_slot_template, ctx, /*$$scope*/ ctx[8], get_number_slot_context);
    	const number_slot_or_fallback = number_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (number_slot_or_fallback) number_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (number_slot_or_fallback) {
    				number_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (number_slot) {
    				if (number_slot.p && (!current || dirty & /*$$scope, options*/ 260)) {
    					update_slot_base(
    						number_slot,
    						number_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(number_slot_template, /*$$scope*/ ctx[8], dirty, get_number_slot_changes),
    						get_number_slot_context
    					);
    				}
    			} else {
    				if (number_slot_or_fallback && number_slot_or_fallback.p && (!current || dirty & /*options*/ 4)) {
    					number_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(number_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(number_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (number_slot_or_fallback) number_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(48:6) {#if option.type === 'number'}",
    		ctx
    	});

    	return block;
    }

    // (69:26)            
    function fallback_block_3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#000000");
    			attr_dev(path, "d", "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z");
    			add_location(path, file$a, 73, 12, 2306);
    			set_style(svg, "width", "24px");
    			set_style(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$a, 69, 10, 2202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(69:26)            ",
    		ctx
    	});

    	return block;
    }

    // (57:26)            
    function fallback_block_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#000000");
    			attr_dev(path, "d", "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z");
    			add_location(path, file$a, 61, 12, 1929);
    			set_style(svg, "width", "24px");
    			set_style(svg, "height", "24px");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$a, 57, 10, 1825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(57:26)            ",
    		ctx
    	});

    	return block;
    }

    // (53:30)            
    function fallback_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "...";
    			add_location(span, file$a, 53, 10, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(53:30)            ",
    		ctx
    	});

    	return block;
    }

    // (49:51)            
    function fallback_block(ctx) {
    	let span;
    	let t_value = /*option*/ ctx[12].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 49, 10, 1521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 4 && t_value !== (t_value = /*option*/ ctx[12].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(49:51)            ",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#each options as option}
    function create_each_block$1(ctx) {
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_if_block_2$1, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[12].type === 'number') return 0;
    		if (/*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === ELLIPSIS) return 1;
    		if (/*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE) return 2;
    		if (/*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*option*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(span, "class", "option");
    			toggle_class(span, "number", /*option*/ ctx[12].type === 'number');
    			toggle_class(span, "prev", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE);
    			toggle_class(span, "next", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE);
    			toggle_class(span, "disabled", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE && /*currentPage*/ ctx[0] >= /*totalPages*/ ctx[1] || /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE && /*currentPage*/ ctx[0] <= 1);
    			toggle_class(span, "ellipsis", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === ELLIPSIS);
    			toggle_class(span, "active", /*option*/ ctx[12].type === 'number' && /*option*/ ctx[12].value === /*currentPage*/ ctx[0]);
    			add_location(span, file$a, 34, 4, 751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(span, null);
    			}

    			append_dev(span, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(span, t);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty & /*options*/ 4) {
    				toggle_class(span, "number", /*option*/ ctx[12].type === 'number');
    			}

    			if (dirty & /*options, PREVIOUS_PAGE*/ 4) {
    				toggle_class(span, "prev", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE);
    			}

    			if (dirty & /*options, NEXT_PAGE*/ 4) {
    				toggle_class(span, "next", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE);
    			}

    			if (dirty & /*options, NEXT_PAGE, currentPage, totalPages, PREVIOUS_PAGE*/ 7) {
    				toggle_class(span, "disabled", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === NEXT_PAGE && /*currentPage*/ ctx[0] >= /*totalPages*/ ctx[1] || /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === PREVIOUS_PAGE && /*currentPage*/ ctx[0] <= 1);
    			}

    			if (dirty & /*options, ELLIPSIS*/ 4) {
    				toggle_class(span, "ellipsis", /*option*/ ctx[12].type === 'symbol' && /*option*/ ctx[12].symbol === ELLIPSIS);
    			}

    			if (dirty & /*options, currentPage*/ 5) {
    				toggle_class(span, "active", /*option*/ ctx[12].type === 'number' && /*option*/ ctx[12].value === /*currentPage*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(34:2) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let current;
    	let each_value = /*options*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pagination-nav");
    			add_location(div, file$a, 32, 0, 690);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options, PREVIOUS_PAGE, NEXT_PAGE, currentPage, totalPages, ELLIPSIS, handleOptionClick, $$scope*/ 271) {
    				each_value = /*options*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let options;
    	let totalPages;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaginationNav', slots, ['number','ellipsis','prev','next']);
    	const dispatch = createEventDispatcher();
    	let { totalItems = 0 } = $$props;
    	let { pageSize = 1 } = $$props;
    	let { currentPage = 1 } = $$props;
    	let { limit = null } = $$props;
    	let { showStepOptions = false } = $$props;

    	function handleOptionClick(option) {
    		dispatch('setPage', { page: option.value });
    	}

    	const writable_props = ['totalItems', 'pageSize', 'currentPage', 'limit', 'showStepOptions'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaginationNav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = option => handleOptionClick(option);

    	$$self.$$set = $$props => {
    		if ('totalItems' in $$props) $$invalidate(4, totalItems = $$props.totalItems);
    		if ('pageSize' in $$props) $$invalidate(5, pageSize = $$props.pageSize);
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('limit' in $$props) $$invalidate(6, limit = $$props.limit);
    		if ('showStepOptions' in $$props) $$invalidate(7, showStepOptions = $$props.showStepOptions);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		generateNavigationOptions,
    		PREVIOUS_PAGE,
    		NEXT_PAGE,
    		ELLIPSIS,
    		dispatch,
    		totalItems,
    		pageSize,
    		currentPage,
    		limit,
    		showStepOptions,
    		handleOptionClick,
    		totalPages,
    		options
    	});

    	$$self.$inject_state = $$props => {
    		if ('totalItems' in $$props) $$invalidate(4, totalItems = $$props.totalItems);
    		if ('pageSize' in $$props) $$invalidate(5, pageSize = $$props.pageSize);
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('limit' in $$props) $$invalidate(6, limit = $$props.limit);
    		if ('showStepOptions' in $$props) $$invalidate(7, showStepOptions = $$props.showStepOptions);
    		if ('totalPages' in $$props) $$invalidate(1, totalPages = $$props.totalPages);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*totalItems, pageSize, currentPage, limit, showStepOptions*/ 241) {
    			$$invalidate(2, options = generateNavigationOptions({
    				totalItems,
    				pageSize,
    				currentPage,
    				limit,
    				showStepOptions
    			}));
    		}

    		if ($$self.$$.dirty & /*totalItems, pageSize*/ 48) {
    			$$invalidate(1, totalPages = Math.ceil(totalItems / pageSize));
    		}
    	};

    	return [
    		currentPage,
    		totalPages,
    		options,
    		handleOptionClick,
    		totalItems,
    		pageSize,
    		limit,
    		showStepOptions,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class PaginationNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			totalItems: 4,
    			pageSize: 5,
    			currentPage: 0,
    			limit: 6,
    			showStepOptions: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaginationNav",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get totalItems() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set totalItems(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSize() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSize(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentPage() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPage(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limit() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limit(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showStepOptions() {
    		throw new Error("<PaginationNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showStepOptions(value) {
    		throw new Error("<PaginationNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-paginate\src\LightPaginationNav.svelte generated by Svelte v3.46.4 */
    const file$9 = "node_modules\\svelte-paginate\\src\\LightPaginationNav.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let paginationnav;
    	let current;
    	const paginationnav_spread_levels = [/*$$props*/ ctx[0]];
    	let paginationnav_props = {};

    	for (let i = 0; i < paginationnav_spread_levels.length; i += 1) {
    		paginationnav_props = assign(paginationnav_props, paginationnav_spread_levels[i]);
    	}

    	paginationnav = new PaginationNav({
    			props: paginationnav_props,
    			$$inline: true
    		});

    	paginationnav.$on("setPage", /*setPage_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(paginationnav.$$.fragment);
    			attr_dev(div, "class", "light-pagination-nav svelte-s5ru8s");
    			add_location(div, file$9, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(paginationnav, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const paginationnav_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(paginationnav_spread_levels, [get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			paginationnav.$set(paginationnav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(paginationnav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LightPaginationNav', slots, []);

    	function setPage_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ PaginationNav });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, setPage_handler];
    }

    class LightPaginationNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightPaginationNav",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    class HttpService {
        static async fetchPost(payload, params) {
            return await fetch(`${HttpService.DOMAIN}/${params}`, {
                method: 'post',
                headers: {
                    'Authorization': HttpService.AUTHORIZATION_KEY,
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            }).then((response) => response.json())
                .then(async (data) => {
                return data;
            })
                .catch(error => {
                return error;
            });
        }
        static async fetchGet(params) {
            return await fetch(`${HttpService.DOMAIN}${params}`, {
                method: 'get',
                headers: {
                    'Authorization': HttpService.AUTHORIZATION_KEY,
                }
            }).then((response) => response.json())
                .then(async (data) => data)
                .catch(error => {
                return error;
            });
        }
    }
    HttpService.DOMAIN = "https://admin.dev.orcam.io/api/v8/users";
    HttpService.AUTHORIZATION_KEY = 'accessKey 7f4ff3ae-53c2-4622-9fc4-28290a130e5c';

    /* src\components\Loader.svelte generated by Svelte v3.46.4 */

    const file$8 = "src\\components\\Loader.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let span;
    	let t1;
    	let i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading....";
    			t1 = space();
    			i = element("i");
    			add_location(span, file$8, 5, 4, 52);
    			attr_dev(i, "class", "fa fa-spinner");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$8, 6, 4, 82);
    			attr_dev(div, "class", "loading svelte-agaxvt");
    			add_location(div, file$8, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, i);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\UserList.svelte generated by Svelte v3.46.4 */

    const { console: console_1$2 } = globals;
    const file$7 = "src\\components\\UserList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (39:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let t;
    	let lightpaginationnav;
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	lightpaginationnav = new LightPaginationNav({
    			props: {
    				totalItems: /*totalItems*/ ctx[3],
    				pageSize,
    				currentPage: /*currentPage*/ ctx[1],
    				limit: 1,
    				showStepOptions: true
    			},
    			$$inline: true
    		});

    	lightpaginationnav.$on("setPage", /*setPage_handler*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(lightpaginationnav.$$.fragment);
    			attr_dev(div, "class", "user-grid svelte-cnommw");
    			add_location(div, file$7, 39, 0, 1127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(lightpaginationnav, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleUserDetails, items, Date*/ 17) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const lightpaginationnav_changes = {};
    			if (dirty & /*currentPage*/ 2) lightpaginationnav_changes.currentPage = /*currentPage*/ ctx[1];
    			lightpaginationnav.$set(lightpaginationnav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightpaginationnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightpaginationnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(lightpaginationnav, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(39:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:0) {#if loading }
    function create_if_block$2(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:0) {#if loading }",
    		ctx
    	});

    	return block;
    }

    // (53:12) {#if user?.email}
    function create_if_block_1$1(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = /*user*/ ctx[10].email + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Mail:";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			attr_dev(span0, "class", "label svelte-cnommw");
    			add_location(span0, file$7, 54, 20, 1695);
    			add_location(span1, file$7, 55, 20, 1750);
    			add_location(div, file$7, 53, 16, 1668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t2_value !== (t2_value = /*user*/ ctx[10].email + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(53:12) {#if user?.email}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#each items as user, i}
    function create_each_block(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = new Date(/*user*/ ctx[10].createdAt).toLocaleDateString() + "";
    	let t2;
    	let t3;
    	let div1;
    	let span2;
    	let t5;
    	let span3;
    	let t6_value = new Date(/*user*/ ctx[10].updatedAt).toLocaleDateString() + "";
    	let t6;
    	let t7;
    	let t8;
    	let button;
    	let t10;
    	let mounted;
    	let dispose;
    	let if_block = /*user*/ ctx[10]?.email && create_if_block_1$1(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*user*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Created At:";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "Updated At:";
    			t5 = space();
    			span3 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			button = element("button");
    			button.textContent = "More Detials";
    			t10 = space();
    			attr_dev(span0, "class", "label svelte-cnommw");
    			add_location(span0, file$7, 45, 16, 1298);
    			add_location(span1, file$7, 46, 16, 1355);
    			add_location(div0, file$7, 44, 12, 1259);
    			attr_dev(span2, "class", "label svelte-cnommw");
    			add_location(span2, file$7, 49, 16, 1476);
    			add_location(span3, file$7, 50, 16, 1533);
    			add_location(div1, file$7, 48, 12, 1453);
    			attr_dev(button, "class", "svelte-cnommw");
    			add_location(button, file$7, 58, 12, 1832);
    			attr_dev(div2, "class", "user-wrap svelte-cnommw");
    			add_location(div2, file$7, 43, 8, 1220);
    			attr_dev(div3, "class", "user svelte-cnommw");
    			add_location(div3, file$7, 42, 4, 1192);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, span2);
    			append_dev(div1, t5);
    			append_dev(div1, span3);
    			append_dev(span3, t6);
    			append_dev(div2, t7);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t8);
    			append_dev(div2, button);
    			append_dev(div3, t10);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, { once: true }, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t2_value !== (t2_value = new Date(/*user*/ ctx[10].createdAt).toLocaleDateString() + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*items*/ 1 && t6_value !== (t6_value = new Date(/*user*/ ctx[10].updatedAt).toLocaleDateString() + "")) set_data_dev(t6, t6_value);

    			if (/*user*/ ctx[10]?.email) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div2, t8);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(41:4) {#each items as user, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "User List";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$7, 35, 0, 1069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const pageSize = 10;

    function instance$7($$self, $$props, $$invalidate) {
    	let paginatedItems;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserList', slots, []);
    	let items = [];
    	let loading = false;
    	let currentPage = 1;
    	let totalItems = currentPage * pageSize * pageSize;

    	onMount(async () => {
    		$$invalidate(0, items = await getUserList());
    	});

    	async function getUserList() {
    		$$invalidate(2, loading = true);

    		return await HttpService.fetchGet(`?${currentPage - 1}&size=${pageSize}`).then(data => {
    			$$invalidate(2, loading = false);
    			return data.items;
    		}).catch(error => {
    			console.log(error);
    			return [];
    		});
    	}

    	function handleUserDetails(userId) {
    		navigateTo(`/UserDetails/${userId}`);
    	}

    	async function handlePaginateClick(e) {
    		$$invalidate(1, currentPage = e.detail.page);
    		$$invalidate(0, items = await getUserList());
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<UserList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = user => handleUserDetails(user.userId);
    	const setPage_handler = e => handlePaginateClick(e);

    	$$self.$capture_state = () => ({
    		Navigate,
    		navigateTo,
    		paginate,
    		LightPaginationNav,
    		identity,
    		onMount,
    		HttpService,
    		Loader,
    		items,
    		loading,
    		currentPage,
    		pageSize,
    		totalItems,
    		getUserList,
    		handleUserDetails,
    		handlePaginateClick,
    		paginatedItems
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    		if ('currentPage' in $$props) $$invalidate(1, currentPage = $$props.currentPage);
    		if ('totalItems' in $$props) $$invalidate(3, totalItems = $$props.totalItems);
    		if ('paginatedItems' in $$props) paginatedItems = $$props.paginatedItems;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, currentPage*/ 3) {
    			paginatedItems = paginate({ items, pageSize, currentPage });
    		}
    	};

    	return [
    		items,
    		currentPage,
    		loading,
    		totalItems,
    		handleUserDetails,
    		handlePaginateClick,
    		click_handler,
    		setPage_handler
    	];
    }

    class UserList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserList",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\About.svelte generated by Svelte v3.46.4 */

    const { console: console_1$1 } = globals;
    const file$6 = "src\\components\\About.svelte";

    function create_fragment$6(ctx) {
    	let h1;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "About Orcam";
    			t1 = space();
    			div = element("div");
    			div.textContent = "OrCam’s mission is to harness the power of artificial vision by incorporating pioneering technology into a wearable platform which improves the lives of individuals who are blind, visually impaired, and have reading difficulties.\r\n\r\n\tOrCam was jointly founded in 2010 by Prof. Amnon Shashua and Mr. Ziv Aviram, who are also the co-founders of Mobileye, the collision avoidance system leader and autonomous driving innovator. The original OrCam MyEye device was launched in 2015, and the next generation OrCam MyEye 2.0 was launched in 2017.";
    			add_location(h1, file$6, 4, 0, 47);
    			attr_dev(div, "class", "about-body svelte-1el2ixm");
    			add_location(div, file$6, 8, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	console.log("About");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\lib\Form.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1 } = globals;
    const file$5 = "src\\lib\\Form.svelte";

    function create_fragment$5(ctx) {
    	let form_1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			form_1 = element("form");
    			if (default_slot) default_slot.c();
    			attr_dev(form_1, "class", "svelte-1duz0nd");
    			add_location(form_1, file$5, 43, 2, 1383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form_1, anchor);

    			if (default_slot) {
    				default_slot.m(form_1, null);
    			}

    			/*form_1_binding*/ ctx[7](form_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form_1, "submit", prevent_default(/*onSubmit*/ ctx[2]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form_1);
    			if (default_slot) default_slot.d(detaching);
    			/*form_1_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $errors;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Form', slots, ['default']);
    	let { form = {} } = $$props;
    	let formEl;
    	const dispatch = createEventDispatcher();
    	let errors = writable({});
    	validate_store(errors, 'errors');
    	component_subscribe($$self, errors, value => $$invalidate(8, $errors = value));

    	function onBlur(e) {
    		validateField(e.target.name, e.target.value);
    	}

    	function isFormValid() {
    		return !Object.values($errors).some(field => Object.values(field).some(errorObject => errorObject.error));
    	}

    	function validateField(field, value) {
    		var _a;

    		((_a = form[field]) === null || _a === void 0
    		? void 0
    		: _a.validators) && form[field].validators.forEach(fn => {
    			const error = fn(value);

    			errors.update(e => {
    				e[field] = Object.assign(Object.assign({}, e[field]), error);
    				return e;
    			});
    		});
    	}

    	function validateForm(data) {
    		Object.keys(data).forEach(field => validateField(field, data[field]));
    	}

    	function onSubmit(e) {
    		const formData = new FormData(e.target);
    		const data = {};

    		for (let field of formData) {
    			const [key, value] = field;
    			data[key] = value;
    		}

    		validateForm(data);
    		return dispatch('submit', { valid: isFormValid(), data });
    	}

    	function reset() {
    		formEl.reset();
    	}

    	setContext('form', { errors, onBlur });
    	const writable_props = ['form'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function form_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			formEl = $$value;
    			$$invalidate(0, formEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('form' in $$props) $$invalidate(3, form = $$props.form);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		createEventDispatcher,
    		writable,
    		form,
    		formEl,
    		dispatch,
    		errors,
    		onBlur,
    		isFormValid,
    		validateField,
    		validateForm,
    		onSubmit,
    		reset,
    		$errors
    	});

    	$$self.$inject_state = $$props => {
    		if ('form' in $$props) $$invalidate(3, form = $$props.form);
    		if ('formEl' in $$props) $$invalidate(0, formEl = $$props.formEl);
    		if ('errors' in $$props) $$invalidate(1, errors = $$props.errors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [formEl, errors, onSubmit, form, reset, $$scope, slots, form_1_binding];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { form: 3, reset: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get form() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set form(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reset() {
    		return this.$$.ctx[4];
    	}

    	set reset(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\Input.svelte generated by Svelte v3.46.4 */
    const file$4 = "src\\lib\\Input.svelte";

    function create_fragment$4(ctx) {
    	let label_1;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			attr_dev(label_1, "for", /*name*/ ctx[2]);
    			add_location(label_1, file$4, 9, 2, 219);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "type", /*type*/ ctx[0]);
    			input.value = /*value*/ ctx[3];
    			add_location(input, file$4, 10, 2, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "blur", /*onBlur*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (dirty & /*name*/ 4) {
    				attr_dev(label_1, "for", /*name*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*type*/ 1) {
    				attr_dev(input, "type", /*type*/ ctx[0]);
    			}

    			if (dirty & /*value*/ 8 && input.value !== /*value*/ ctx[3]) {
    				prop_dev(input, "value", /*value*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, []);
    	let { type = 'text' } = $$props;
    	let { label } = $$props;
    	let { name } = $$props;
    	let { value } = $$props;
    	const { onBlur } = getContext('form');
    	const writable_props = ['type', 'label', 'name', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		type,
    		label,
    		name,
    		value,
    		onBlur
    	});

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, label, name, value, onBlur];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { type: 0, label: 1, name: 2, value: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[1] === undefined && !('label' in props)) {
    			console.warn("<Input> was created without expected prop 'label'");
    		}

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<Input> was created without expected prop 'name'");
    		}

    		if (/*value*/ ctx[3] === undefined && !('value' in props)) {
    			console.warn("<Input> was created without expected prop 'value'");
    		}
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\Error.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1$1 } = globals;
    const file$3 = "src\\lib\\Error.svelte";

    // (10:0) {#if $errors?.[fieldName]?.[errorKey]?.error}
    function create_if_block$1(ctx) {
    	let p;
    	let t_value = (/*message*/ ctx[0] || /*$errors*/ ctx[3][/*fieldName*/ ctx[1]][/*errorKey*/ ctx[2]].message) + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "error-message svelte-1uwfgc0");
    			add_location(p, file$3, 10, 0, 273);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message, $errors, fieldName, errorKey*/ 15 && t_value !== (t_value = (/*message*/ ctx[0] || /*$errors*/ ctx[3][/*fieldName*/ ctx[1]][/*errorKey*/ ctx[2]].message) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(10:0) {#if $errors?.[fieldName]?.[errorKey]?.error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*$errors*/ ctx[3]?.[/*fieldName*/ ctx[1]]?.[/*errorKey*/ ctx[2]]?.error && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$errors*/ ctx[3]?.[/*fieldName*/ ctx[1]]?.[/*errorKey*/ ctx[2]]?.error) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $errors;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	const { errors } = getContext('form');
    	validate_store(errors, 'errors');
    	component_subscribe($$self, errors, value => $$invalidate(3, $errors = value));
    	let { message = null } = $$props;
    	let { fieldName } = $$props;
    	let { errorKey } = $$props;
    	const writable_props = ['message', 'fieldName', 'errorKey'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('fieldName' in $$props) $$invalidate(1, fieldName = $$props.fieldName);
    		if ('errorKey' in $$props) $$invalidate(2, errorKey = $$props.errorKey);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		errors,
    		message,
    		fieldName,
    		errorKey,
    		$errors
    	});

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('fieldName' in $$props) $$invalidate(1, fieldName = $$props.fieldName);
    		if ('errorKey' in $$props) $$invalidate(2, errorKey = $$props.errorKey);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, fieldName, errorKey, $errors, errors];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { message: 0, fieldName: 1, errorKey: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fieldName*/ ctx[1] === undefined && !('fieldName' in props)) {
    			console.warn("<Error> was created without expected prop 'fieldName'");
    		}

    		if (/*errorKey*/ ctx[2] === undefined && !('errorKey' in props)) {
    			console.warn("<Error> was created without expected prop 'errorKey'");
    		}
    	}

    	get message() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fieldName() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fieldName(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorKey() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorKey(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function required(value) {
        if (value === '' || value == null) {
            return { required: { error: true, message: 'Field is required' } };
        }
        return { required: { error: false } };
    }
    function isNumber(value) {
        if (isNaN(+value) || value == null) {
            return { isNumber: { error: true, message: 'Field is not number' } };
        }
        return { isNumber: { error: false } };
    }
    const Validators = {
        required,
        isNumber
    };

    class userUpdateRequest {
    }

    /* src\components\UserDetails.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1, console: console_1 } = globals;
    const file$2 = "src\\components\\UserDetails.svelte";

    // (104:0) {:else}
    function create_else_block(ctx) {
    	let h1;
    	let t1;
    	let form_1;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	let form_1_props = {
    		form: /*form*/ ctx[5],
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	form_1 = new Form({ props: form_1_props, $$inline: true });
    	/*form_1_binding*/ ctx[8](form_1);
    	form_1.$on("submit", /*onSubmit*/ ctx[6]);
    	let if_block0 = /*successMessage*/ ctx[1] !== "" && create_if_block_2(ctx);
    	let if_block1 = /*errorMessage*/ ctx[2] !== "" && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "User Details";
    			t1 = space();
    			create_component(form_1.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(h1, "class", "svelte-1xwjtdr");
    			add_location(h1, file$2, 104, 0, 3285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(form_1, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const form_1_changes = {};

    			if (dirty & /*$$scope, userDetails*/ 8200) {
    				form_1_changes.$$scope = { dirty, ctx };
    			}

    			form_1.$set(form_1_changes);

    			if (/*successMessage*/ ctx[1] !== "") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*errorMessage*/ ctx[2] !== "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			/*form_1_binding*/ ctx[8](null);
    			destroy_component(form_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(104:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (102:0) {#if loading}
    function create_if_block(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(102:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (106:0) <Form {form} on:submit={onSubmit} bind:this={formEl}>
    function create_default_slot(ctx) {
    	let div0;
    	let input0;
    	let t0;
    	let error0;
    	let t1;
    	let div1;
    	let input1;
    	let t2;
    	let error1;
    	let t3;
    	let div3;
    	let label;
    	let t5;
    	let div2;
    	let span0;
    	let input2;
    	let t6;
    	let error2;
    	let t7;
    	let span1;
    	let input3;
    	let t8;
    	let error3;
    	let t9;
    	let error4;
    	let t10;
    	let div4;
    	let input4;
    	let t11;
    	let error5;
    	let t12;
    	let button;
    	let current;

    	input0 = new Input({
    			props: {
    				label: "first Name",
    				name: "firstName",
    				value: /*userDetails*/ ctx[3]?.firstName ?? ""
    			},
    			$$inline: true
    		});

    	error0 = new Error$1({
    			props: {
    				fieldName: "firstName",
    				errorKey: "required",
    				message: "First Name is required"
    			},
    			$$inline: true
    		});

    	input1 = new Input({
    			props: {
    				label: "last Name",
    				name: "lastName",
    				value: /*userDetails*/ ctx[3]?.lastName ?? ""
    			},
    			$$inline: true
    		});

    	error1 = new Error$1({
    			props: {
    				fieldName: "lastName",
    				errorKey: "required",
    				message: "Last Name is required"
    			},
    			$$inline: true
    		});

    	input2 = new Input({
    			props: {
    				label: "",
    				name: "countryCode",
    				value: /*userDetails*/ ctx[3]?.countryCode ?? ""
    			},
    			$$inline: true
    		});

    	error2 = new Error$1({
    			props: {
    				fieldName: "countryCode",
    				errorKey: "required",
    				message: "Phone Number is required"
    			},
    			$$inline: true
    		});

    	input3 = new Input({
    			props: {
    				label: "",
    				name: "phone",
    				value: /*userDetails*/ ctx[3]?.phone ?? ""
    			},
    			$$inline: true
    		});

    	error3 = new Error$1({
    			props: {
    				fieldName: "phone",
    				errorKey: "required",
    				message: "Phone Number is required"
    			},
    			$$inline: true
    		});

    	error4 = new Error$1({
    			props: { fieldName: "phone", errorKey: "isNumber" },
    			$$inline: true
    		});

    	input4 = new Input({
    			props: {
    				label: "Email",
    				name: "email",
    				value: /*userDetails*/ ctx[3]?.email ?? ""
    			},
    			$$inline: true
    		});

    	error5 = new Error$1({
    			props: {
    				fieldName: "email",
    				errorKey: "required",
    				message: "email is required"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(input0.$$.fragment);
    			t0 = space();
    			create_component(error0.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(input1.$$.fragment);
    			t2 = space();
    			create_component(error1.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			label = element("label");
    			label.textContent = "Phone Number";
    			t5 = space();
    			div2 = element("div");
    			span0 = element("span");
    			create_component(input2.$$.fragment);
    			t6 = space();
    			create_component(error2.$$.fragment);
    			t7 = space();
    			span1 = element("span");
    			create_component(input3.$$.fragment);
    			t8 = space();
    			create_component(error3.$$.fragment);
    			t9 = space();
    			create_component(error4.$$.fragment);
    			t10 = space();
    			div4 = element("div");
    			create_component(input4.$$.fragment);
    			t11 = space();
    			create_component(error5.$$.fragment);
    			t12 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(div0, "class", "svelte-1xwjtdr");
    			add_location(div0, file$2, 106, 4, 3367);
    			attr_dev(div1, "class", "svelte-1xwjtdr");
    			add_location(div1, file$2, 114, 4, 3606);
    			attr_dev(label, "class", "svelte-1xwjtdr");
    			add_location(label, file$2, 123, 6, 3866);
    			attr_dev(span0, "class", "countryCode svelte-1xwjtdr");
    			add_location(span0, file$2, 125, 8, 3938);
    			attr_dev(span1, "class", "phone svelte-1xwjtdr");
    			add_location(span1, file$2, 133, 8, 4227);
    			attr_dev(div2, "class", "phone-wrapper svelte-1xwjtdr");
    			add_location(div2, file$2, 124, 6, 3901);
    			attr_dev(div3, "class", "svelte-1xwjtdr");
    			add_location(div3, file$2, 122, 4, 3853);
    			attr_dev(div4, "class", "svelte-1xwjtdr");
    			add_location(div4, file$2, 144, 4, 4582);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1xwjtdr");
    			add_location(button, file$2, 152, 4, 4798);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(input0, div0, null);
    			append_dev(div0, t0);
    			mount_component(error0, div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(input1, div1, null);
    			append_dev(div1, t2);
    			mount_component(error1, div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, label);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, span0);
    			mount_component(input2, span0, null);
    			append_dev(span0, t6);
    			mount_component(error2, span0, null);
    			append_dev(div2, t7);
    			append_dev(div2, span1);
    			mount_component(input3, span1, null);
    			append_dev(span1, t8);
    			mount_component(error3, span1, null);
    			append_dev(span1, t9);
    			mount_component(error4, span1, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(input4, div4, null);
    			append_dev(div4, t11);
    			mount_component(error5, div4, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, button, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input0_changes = {};
    			if (dirty & /*userDetails*/ 8) input0_changes.value = /*userDetails*/ ctx[3]?.firstName ?? "";
    			input0.$set(input0_changes);
    			const input1_changes = {};
    			if (dirty & /*userDetails*/ 8) input1_changes.value = /*userDetails*/ ctx[3]?.lastName ?? "";
    			input1.$set(input1_changes);
    			const input2_changes = {};
    			if (dirty & /*userDetails*/ 8) input2_changes.value = /*userDetails*/ ctx[3]?.countryCode ?? "";
    			input2.$set(input2_changes);
    			const input3_changes = {};
    			if (dirty & /*userDetails*/ 8) input3_changes.value = /*userDetails*/ ctx[3]?.phone ?? "";
    			input3.$set(input3_changes);
    			const input4_changes = {};
    			if (dirty & /*userDetails*/ 8) input4_changes.value = /*userDetails*/ ctx[3]?.email ?? "";
    			input4.$set(input4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(error0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(error1.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			transition_in(error2.$$.fragment, local);
    			transition_in(input3.$$.fragment, local);
    			transition_in(error3.$$.fragment, local);
    			transition_in(error4.$$.fragment, local);
    			transition_in(input4.$$.fragment, local);
    			transition_in(error5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(error0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(error1.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			transition_out(error2.$$.fragment, local);
    			transition_out(input3.$$.fragment, local);
    			transition_out(error3.$$.fragment, local);
    			transition_out(error4.$$.fragment, local);
    			transition_out(input4.$$.fragment, local);
    			transition_out(error5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(input0);
    			destroy_component(error0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(input1);
    			destroy_component(error1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			destroy_component(input2);
    			destroy_component(error2);
    			destroy_component(input3);
    			destroy_component(error3);
    			destroy_component(error4);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div4);
    			destroy_component(input4);
    			destroy_component(error5);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(106:0) <Form {form} on:submit={onSubmit} bind:this={formEl}>",
    		ctx
    	});

    	return block;
    }

    // (155:4) {#if successMessage !== ""}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*successMessage*/ ctx[1]);
    			attr_dev(div, "class", "success-message svelte-1xwjtdr");
    			add_location(div, file$2, 155, 6, 4887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*successMessage*/ 2) set_data_dev(t, /*successMessage*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(155:4) {#if successMessage !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (158:4) {#if errorMessage !== ""}
    function create_if_block_1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("`Error: ");
    			t1 = text(/*errorMessage*/ ctx[2]);
    			t2 = text("`");
    			attr_dev(div, "class", "error-message svelte-1xwjtdr");
    			add_location(div, file$2, 158, 6, 4988);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMessage*/ 4) set_data_dev(t1, /*errorMessage*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(158:4) {#if errorMessage !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserDetails', slots, []);
    	let { currentRoute } = $$props;
    	let currentUser = currentRoute.namedParams.userId;
    	let successMessage = "";
    	let errorMessage = "";
    	let userDetails;
    	let userRequest;
    	let { loading = false } = $$props;
    	let formEl;

    	let form = {
    		firstName: { validators: [Validators.required] },
    		lastName: { validators: [Validators.required] },
    		phone: {
    			validators: [Validators.required, Validators.isNumber]
    		},
    		email: { validators: [Validators.required] }
    	};

    	async function onSubmit(e) {
    		var _a;

    		if ((_a = e === null || e === void 0 ? void 0 : e.detail) === null || _a === void 0
    		? void 0
    		: _a.valid) {
    			userRequest = new userUpdateRequest();
    			userRequest = e.detail.data;
    			debugger;
    			userRequest.phone = `${e.detail.data.countryCode}${e.detail.data.phone}`;
    			delete userRequest["countryCode"];

    			await UpdateUser(e.detail.data).then(async data => {
    				$$invalidate(3, userDetails = await GetUserDetails());
    			});
    		} else {
    			console.log('Invalid Form');
    		}
    	}

    	onMount(async () => {
    		$$invalidate(3, userDetails = await GetUserDetails());
    	});

    	async function GetUserDetails() {
    		$$invalidate(0, loading = true);

    		if (currentUser) {
    			return await HttpService.fetchGet(`/${currentUser}`).then(data => {
    				var _a, _b;
    				$$invalidate(0, loading = false);
    				let response = data;

    				response.countryCode = (_a = data === null || data === void 0 ? void 0 : data.phone) === null || _a === void 0
    				? void 0
    				: _a.substring(0, 4);

    				response.phone = (_b = data === null || data === void 0 ? void 0 : data.phone) === null || _b === void 0
    				? void 0
    				: _b.substring(4, data.phone.length);

    				return response;
    			}).catch(error => {
    				$$invalidate(0, loading = false);
    				$$invalidate(2, errorMessage = error);
    				return [];
    			});
    		} else {
    			$$invalidate(0, loading = false);
    			$$invalidate(2, errorMessage = "not Get UserId");
    		} //Show Error 
    	}

    	async function UpdateUser(data) {
    		$$invalidate(0, loading = true);
    		$$invalidate(2, errorMessage = "");
    		$$invalidate(1, successMessage = "");
    		let res = false;

    		return await HttpService.fetchPost(data, currentUser).then(async data => {
    			$$invalidate(0, loading = false);

    			if (data === null || data === void 0 ? void 0 : data.message) {
    				//Error
    				$$invalidate(2, errorMessage = data === null || data === void 0 ? void 0 : data.message);
    			} else {
    				res = true;
    				$$invalidate(1, successMessage = "user details updated successfully");
    			}

    			return res;
    		}).catch(error => {
    			$$invalidate(0, loading = false);
    			$$invalidate(2, errorMessage = error);
    			return res;
    		});
    	}

    	const writable_props = ['currentRoute', 'loading'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<UserDetails> was created with unknown prop '${key}'`);
    	});

    	function form_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			formEl = $$value;
    			$$invalidate(4, formEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('currentRoute' in $$props) $$invalidate(7, currentRoute = $$props.currentRoute);
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		setContext,
    		writable,
    		Form,
    		Input,
    		Error: Error$1,
    		Validators,
    		Navigate,
    		userUpdateRequest,
    		HttpService,
    		Loader,
    		currentRoute,
    		currentUser,
    		successMessage,
    		errorMessage,
    		userDetails,
    		userRequest,
    		loading,
    		formEl,
    		form,
    		onSubmit,
    		GetUserDetails,
    		UpdateUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentRoute' in $$props) $$invalidate(7, currentRoute = $$props.currentRoute);
    		if ('currentUser' in $$props) currentUser = $$props.currentUser;
    		if ('successMessage' in $$props) $$invalidate(1, successMessage = $$props.successMessage);
    		if ('errorMessage' in $$props) $$invalidate(2, errorMessage = $$props.errorMessage);
    		if ('userDetails' in $$props) $$invalidate(3, userDetails = $$props.userDetails);
    		if ('userRequest' in $$props) userRequest = $$props.userRequest;
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    		if ('formEl' in $$props) $$invalidate(4, formEl = $$props.formEl);
    		if ('form' in $$props) $$invalidate(5, form = $$props.form);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loading,
    		successMessage,
    		errorMessage,
    		userDetails,
    		formEl,
    		form,
    		onSubmit,
    		currentRoute,
    		form_1_binding
    	];
    }

    class UserDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { currentRoute: 7, loading: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDetails",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentRoute*/ ctx[7] === undefined && !('currentRoute' in props)) {
    			console_1.warn("<UserDetails> was created without expected prop 'currentRoute'");
    		}
    	}

    	get currentRoute() {
    		throw new Error_1("<UserDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error_1("<UserDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error_1("<UserDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error_1("<UserDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const routes = [
       {
         name: "/",
         component: UserList,
       },
       {
          name: "/about",
          component: About
       },
       {
          name: "/userDetails/:userId",
          component: UserDetails
       }

     ];

    /* src\components\Layout.svelte generated by Svelte v3.46.4 */
    const file$1 = "src\\components\\Layout.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let router;
    	let t4;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "User List";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "About";
    			t3 = space();
    			create_component(router.$$.fragment);
    			t4 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1o0h47o");
    			add_location(a0, file$1, 6, 4, 130);
    			attr_dev(a1, "href", "/about");
    			attr_dev(a1, "class", "svelte-1o0h47o");
    			add_location(a1, file$1, 7, 4, 161);
    			attr_dev(nav, "class", "svelte-1o0h47o");
    			add_location(nav, file$1, 5, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			insert_dev(target, t3, anchor);
    			mount_component(router, target, anchor);
    			insert_dev(target, t4, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t3);
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t4);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Layout', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ routes, Navigate, Router });
    	return [$$scope, slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let layout;
    	let current;
    	layout = new Layout({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(layout.$$.fragment);
    			attr_dev(main, "class", "svelte-14ci7qx");
    			add_location(main, file, 3, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(layout, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(layout);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Layout });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
