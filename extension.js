const vscode = require("vscode");
const translate = require("google-translate-api");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log(
    'Congratulations, your extension "codigo-tradutor" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "codigo-tradutor.traduza",
    async function () {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Nenhum editor ativo encontrado.");
        return;
      }

      // Obter o texto do editor
      let document = editor.document;
      let text = document.getText();

      // Traduzir o texto para o idioma desejado (exemplo: português 'pt')
      let targetLanguage = "pt";
      let translatedText = await translateText(text, targetLanguage);

      if (!translatedText) {
        // Se a tradução falhar, não continue
        return;
      }

      // Criar um painel webview para espelhar o código traduzido
      const panel = vscode.window.createWebviewPanel(
        "mirrorCodePanel", // Identificador exclusivo do painel
        "Espelho de Código", // Título do painel
        vscode.ViewColumn.Beside, // Onde mostrar o painel. Por exemplo, ViewColumn.One, ViewColumn.Two, etc.
        {
          enableScripts: true, // Permitir a execução de scripts no webview
        }
      );

      // Caminho do arquivo CSS para estilos adicionais
      const stylePath = vscode.Uri.file(
        path.join(context.extensionPath, "styles", "mirrorCode.css")
      );

      // Conteúdo HTML do painel
      panel.webview.html = `
            <html>
            <head>
                <link rel="stylesheet" href="${panel.webview.asWebviewUri(
                  stylePath
                )}">
            </head>
            <body>
                <pre><code>${translatedText}</code></pre>
            </body>
            </html>
        `;
    }
  );

  context.subscriptions.push(disposable);
}

async function translateText(text, targetLanguage) {
  try {
    let translatedText = await translate(text, { to: targetLanguage });
    return translatedText.text;
  } catch (error) {
    console.error("Erro ao traduzir o texto:", error);
    vscode.window.showErrorMessage("Erro ao traduzir o texto.");
    return null;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
