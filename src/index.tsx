import type { Plugin, PluginContext } from "@voiden/sdk";
import { ApyHubExplorer } from "./ApyHubExplorer";

let pluginContext: PluginContext | null = null;
export function getPluginContext() { return pluginContext; }

export default function plugin(context: PluginContext): Plugin {
  return {
    onload(ctx: PluginContext) {
      pluginContext = ctx;

      // Register the component eagerly so persisted tabs can find it after plugin reload
      ctx.registerPanel("main", {
        id: "apyhub-explorer",
        title: "ApyHub Explorer",
        component: ApyHubExplorer,
      });

      ctx.registerStatusBarItem({
        id: "apyhub-explorer",
        icon: "Zap",
        label: "ApyHub",
        tooltip: "Browse ApyHub APIs",
        position: "left",
        onClick: () => {
          ctx.addTab("main", {
            id: "apyhub-explorer",
            icon: "Zap",
            title: "ApyHub Explorer",
            props: {},
            component: ApyHubExplorer,
          });
        },
      });
    },

    onunload() {
      pluginContext = null;
    },
  };
}
