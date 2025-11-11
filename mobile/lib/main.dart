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

class _UploadNotesPage extends StatelessWidget {
  const _UploadNotesPage();

  @override
  Widget build(BuildContext context) {
    return const _Placeholder(
      title: 'Upload Notes',
      subtitle: 'Wire camera, file upload, and OCR here.',
      icon: Icons.camera_alt,
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
