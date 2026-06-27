!macro customInstall
  ; --- .dtm Uzantısı ---
  WriteRegStr HKCU "Software\Classes\.dtm" "" "DTAsistan.Document"
  WriteRegStr HKCU "Software\Classes\.dtm" "Content Type" "application/x-dtm"
  WriteRegStr HKCU "Software\Classes\.dtm\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.dtm\ShellNew" "ItemName" "Doğrudan Temin Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\.dtm\ShellNew" "IconPath" '"$INSTDIR\DTAsistan.exe",0'

  ; --- .dta Uzantısı ---
  WriteRegStr HKCU "Software\Classes\.dta" "" "DTAsistan.Document"
  WriteRegStr HKCU "Software\Classes\.dta" "Content Type" "application/x-dta"
  WriteRegStr HKCU "Software\Classes\.dta\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.dta\ShellNew" "ItemName" "DT Asistan Lite Proje Dosyası"
  WriteRegStr HKCU "Software\Classes\.dta\ShellNew" "IconPath" '"$INSTDIR\DTAsistan.exe",0'

  ; --- .dte Uzantısı ---
  WriteRegStr HKCU "Software\Classes\.dte" "" "DTAsistan.Document"
  WriteRegStr HKCU "Software\Classes\.dte" "Content Type" "application/x-dte"
  WriteRegStr HKCU "Software\Classes\.dte\ShellNew" "NullFile" ""
  WriteRegStr HKCU "Software\Classes\.dte\ShellNew" "ItemName" "DT Asistan Lite Veri Aktarım Dosyası"
  WriteRegStr HKCU "Software\Classes\.dte\ShellNew" "IconPath" '"$INSTDIR\DTAsistan.exe",0'

  ; --- ProgID Tanımı ve Açma Komutu ---
  WriteRegStr HKCU "Software\Classes\DTAsistan.Document" "" "DT Asistan Lite Çalışma Dosyası"
  WriteRegStr HKCU "Software\Classes\DTAsistan.Document\DefaultIcon" "" '"$INSTDIR\DTAsistan.exe",0'
  WriteRegStr HKCU "Software\Classes\DTAsistan.Document\shell\open\command" "" '"$INSTDIR\DTAsistan.exe" "%1"'

  ; --- Windows Explorer'ı yenile ---
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\.dtm"
  DeleteRegKey HKCU "Software\Classes\.dta"
  DeleteRegKey HKCU "Software\Classes\.dte"
  DeleteRegKey HKCU "Software\Classes\DTAsistan.Document"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
