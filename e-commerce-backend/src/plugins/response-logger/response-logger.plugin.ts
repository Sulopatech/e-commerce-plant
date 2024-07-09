import { Logger, Middleware, PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { RESPONSE_LOGGER_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { RequestLoggerMiddleware } from './service/response-logger.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: RESPONSE_LOGGER_PLUGIN_OPTIONS, useFactory: () => ResponseLoggerPlugin.options }],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        // const middleware: Middleware = {
        //     handler: (req: Request, res: Response, next: () => void) => {
        //         const responsetLog = {
        //             status: res.status,
        //             header:res.headers,
        //             body:res.body,
        //             url: res.url
        //         };
        //         console.log(responsetLog)
        //         const requestLog = {
        //             method: req.method,
        //             header:req.headers,
        //             body:req.body,
        //             url: req.url
        //         };
        //         console.log(requestLog)
        //         next();
        //       },
        //       route: '/shop-api'
        //     }
        const middleware: Middleware = {
            handler: new RequestLoggerMiddleware().handler,
            route: '/shop-api',
        }
        config.apiOptions.middleware.push(middleware);
        return config;
        },
    compatibility: '^2.0.0',
})
export class ResponseLoggerPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ResponseLoggerPlugin> {
        this.options = options;
        return ResponseLoggerPlugin;
    }
}
