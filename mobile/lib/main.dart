import 'package:flutter/material.dart';

void main() {
  runApp(const HavilahApp());
}

class HavilahApp extends StatelessWidget {
  const HavilahApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Havilah',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6C63FF)),
        useMaterial3: true,
      ),
      home: const _Shell(),
    );
  }
}

class _Shell extends StatefulWidget {
  const _Shell();

  @override
  State<_Shell> createState() => _ShellState();
}

class _ShellState extends State<_Shell> {
  int _index = 0;

  final _pages = const [
    _DashboardPage(),
    _UploadNotesPage(),
    _ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.upload_file_outlined),
            selectedIcon: Icon(Icons.upload_file),
            label: 'Upload',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _DashboardPage extends StatelessWidget {
  const _DashboardPage();

  @override
  Widget build(BuildContext context) {
    return const _Placeholder(
      title: 'Learning Feed',
      subtitle: 'AI-powered topics, streaks, and goals will live here.',
      icon: Icons.flash_on,
    );
  }
}

class _UploadNotesPage extends StatefulWidget {
  const _UploadNotesPage();

  @override
  State<_UploadNotesPage> createState() => _UploadNotesPageState();
}

class _UploadNotesPageState extends State<_UploadNotesPage> {
  String? _selectedFile;
  bool _isUploading = false;

  void _simulatePickFile() {
    setState(() {
      _selectedFile =
          'chapter-notes-${DateTime.now().millisecondsSinceEpoch}.pdf';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Pretending to select a file…')),
    );
  }

  Future<void> _simulateUpload() async {
    if (_selectedFile == null || _isUploading) return;
    setState(() => _isUploading = true);
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() {
      _isUploading = false;
      _selectedFile = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Upload complete! Hook backend next.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        children: [
          Text(
            'Upload study notes',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Share photos, PDFs, or handwritten notes. We will run OCR and AI analysis once the backend endpoint is ready.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Card(
            elevation: 0,
            color: color.surfaceContainerHighest,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.file_present, color: color.primary),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _selectedFile ?? 'No file selected',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      if (_selectedFile != null)
                        IconButton(
                          tooltip: 'Clear selection',
                          icon: const Icon(Icons.close),
                          onPressed: () => setState(() => _selectedFile = null),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    icon: const Icon(Icons.folder_open),
                    onPressed: _isUploading ? null : _simulatePickFile,
                    label: const Text('Choose file'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: color.outlineVariant),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Tips',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 12),
                  _ChecklistItem(text: 'Use bright lighting when scanning.'),
                  _ChecklistItem(text: 'Capture full pages edge-to-edge.'),
                  _ChecklistItem(text: 'Supported formats: JPG, PNG, PDF.'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed:
                _selectedFile == null || _isUploading ? null : _simulateUpload,
            child: _isUploading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Upload'),
          ),
        ],
      ),
    );
  }
}

class _ProfilePage extends StatelessWidget {
  const _ProfilePage();

  @override
  Widget build(BuildContext context) {
    return const _Placeholder(
      title: 'Profile & Goals',
      subtitle: 'Configure learning style, goals, and language.',
      icon: Icons.person,
    );
  }
}

class _Placeholder extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;

  const _Placeholder({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 72, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }
}

class _ChecklistItem extends StatelessWidget {
  final String text;

  const _ChecklistItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}
