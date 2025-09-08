using SkiaSharp.Views.Maui.Controls;

namespace StreamR.Components;

// All the code in this file is included in all platforms.
public class ButtonComponent : SKCanvasView
{
    public int Width { get; set; }
    public int Height { get; set; }

    public string Text { get; set; } = "Click Me";

    public ButtonComponent()
    {

    }
}